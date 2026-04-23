import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session_id');
  const hasSessionCookie = !!sessionCookie?.value;
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-admin-pathname', pathname);

  if (pathname === '/admin/login') {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protect all other /admin/* routes - require session cookie
  if (pathname.startsWith('/admin')) {
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};

