import { getUserByEmail, verifyPassword } from '@/lib/users.js';
import { createSession } from '@/lib/sessions.js';
import { headers, cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt:', { email, password: '***' });

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', { id: user.id, email: user.email });
    console.log('User object:', user);
    if (!user.password_hash) {
      console.error('❌ User has no password_hash field!');
      return Response.json(
        { error: 'User has no password set' },
        { status: 500 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    console.log('🔑 Password valid:', passwordValid);
    if (!passwordValid) {
      console.log('❌ Password verification failed');
      console.log('   Provided:', password);
      console.log('   Hash stored:', user.password_hash.substring(0, 20) + '...');
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get client IP
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create server-side session
    const sessionId = await createSession(user.id, ipAddress, userAgent);
    console.log('✅ Session created:', sessionId.substring(0, 20) + '...');

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Session cookie set');
    console.log('✅ Login successful for:', email);

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
