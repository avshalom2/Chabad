import { createUser, getAccessLevels, getUserById, getUsers } from '@/lib/users.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

async function requireAdmin() {
  const session = await getCurrentUserSession();
  return session?.access_level === 'admin' ? session : null;
}

export async function GET() {
  try {
    if (!await requireAdmin()) {
      return Response.json({ error: 'אין הרשאה לניהול משתמשים' }, { status: 403 });
    }

    const [users, accessLevels] = await Promise.all([
      getUsers({ activeOnly: false }),
      getAccessLevels(),
    ]);
    return Response.json({ users, accessLevels });
  } catch (error) {
    console.error('Failed to load users:', error);
    return Response.json({ error: 'טעינת המשתמשים נכשלה' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return Response.json({ error: 'אין הרשאה לניהול משתמשים' }, { status: 403 });
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const accessLevelId = Number(body.access_level_id);

    if (!username || !email || !password || !Number.isInteger(accessLevelId)) {
      return Response.json({ error: 'יש למלא שם משתמש, אימייל, סיסמה ותפקיד' }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: 'הסיסמה חייבת להכיל לפחות 8 תווים' }, { status: 400 });
    }

    const id = await createUser({
      username,
      email,
      password,
      display_name: String(body.display_name || '').trim() || null,
      access_level_id: accessLevelId,
    });
    return Response.json(await getUserById(id), { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    const duplicate = error?.code === '23505' || error?.code === 'ER_DUP_ENTRY';
    return Response.json(
      { error: duplicate ? 'שם המשתמש או כתובת האימייל כבר קיימים' : 'יצירת המשתמש נכשלה' },
      { status: duplicate ? 409 : 500 }
    );
  }
}
