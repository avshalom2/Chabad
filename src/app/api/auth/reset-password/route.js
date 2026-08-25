import { getCurrentUserSession } from '@/lib/auth-session.js';
import { changePassword, getUserByEmail } from '@/lib/users.js';
import { deleteAllUserSessions } from '@/lib/sessions.js';

export async function POST(request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.access_level !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, newPassword } = body;

    // Validate input
    if (!email || !newPassword) {
      return Response.json(
        { error: 'Email and new password required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 12) {
      return Response.json(
        { error: 'Password must be at least 12 characters' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await changePassword(user.id, newPassword);
    await deleteAllUserSessions(user.id);

    return Response.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    );
  }
}
