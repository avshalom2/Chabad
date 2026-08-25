import { NextResponse } from 'next/server';
import { getSession } from './lib/sessions.js';

function unauthorizedApiResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

function clearSessionCookie(response) {
  response.cookies.set('session_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

function requiredCapability(request) {
  if (request.method === 'DELETE') return 'can_delete';
  if (request.method === 'PUT' || request.method === 'PATCH') return 'can_update';
  if (request.method === 'POST') {
    return request.nextUrl.pathname.endsWith('/reorder') ? 'can_update' : 'can_create';
  }
  return null;
}

function applyAdminSecurityHeaders(response) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPasswordReset = pathname === '/api/auth/reset-password';
  const isProtectedAdminApi = isAdminApi || isAdminPasswordReset;
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-admin-pathname', pathname);

  if (isLoginPage) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!isAdminPage && !isProtectedAdminApi) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    return isProtectedAdminApi
      ? unauthorizedApiResponse()
      : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let session = null;
  try {
    session = await getSession(sessionId);
  } catch (error) {
    console.error('Admin session validation failed:', error.message);
  }

  if (!session) {
    const response = isProtectedAdminApi
      ? unauthorizedApiResponse()
      : NextResponse.redirect(new URL('/admin/login', request.url));
    return clearSessionCookie(response);
  }

  const capability = isAdminApi ? requiredCapability(request) : null;
  if (capability && !session[capability]) {
    return applyAdminSecurityHeaders(NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    ));
  }

  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const requestOrigin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (
    isProtectedAdminApi
    && isMutation
    && (fetchSite === 'cross-site' || (requestOrigin && requestOrigin !== request.nextUrl.origin))
  ) {
    return applyAdminSecurityHeaders(NextResponse.json(
      { error: 'Cross-site admin requests are not allowed' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    ));
  }

  requestHeaders.set('x-admin-user-id', String(session.user_id));
  requestHeaders.set('x-admin-access-level', String(session.access_level || ''));

  return applyAdminSecurityHeaders(NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  }));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/reset-password'],
};

