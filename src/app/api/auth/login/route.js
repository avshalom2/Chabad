import { changePassword, getUserByEmail, passwordNeedsUpgrade, verifyPassword } from '@/lib/users.js';
import { createSession } from '@/lib/sessions.js';
import { headers, cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      console.error('Login failed: user has no password hash');
      return Response.json(
        { error: 'User has no password set' },
        { status: 500 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (passwordNeedsUpgrade(user.password_hash)) {
      await changePassword(user.id, password);
    }

    // Get client IP
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create server-side session
    const sessionId = await createSession(user.id, ipAddress, userAgent);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Create response with user data
    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        access_level: user.access_level,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
