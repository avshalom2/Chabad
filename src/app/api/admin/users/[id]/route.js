import { changePassword, getAccessLevels, getUserById, updateUser } from '@/lib/users.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

async function requireAdmin() {
  const session = await getCurrentUserSession();
  return session?.access_level === 'admin' ? session : null;
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'אין הרשאה לניהול משתמשים' }, { status: 403 });

    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();
    if (!Number.isInteger(id)) return Response.json({ error: 'משתמש לא תקין' }, { status: 400 });

    const existing = await getUserById(id);
    if (!existing) return Response.json({ error: 'המשתמש לא נמצא' }, { status: 404 });

    const fields = {};
    for (const key of ['username', 'email', 'display_name', 'access_level_id', 'is_active']) {
      if (Object.hasOwn(body, key)) fields[key] = body[key];
    }
    if (Object.hasOwn(fields, 'username')) fields.username = String(fields.username || '').trim();
    if (Object.hasOwn(fields, 'email')) fields.email = String(fields.email || '').trim().toLowerCase();
    if (Object.hasOwn(fields, 'display_name')) fields.display_name = String(fields.display_name || '').trim() || null;
    if (Object.hasOwn(fields, 'access_level_id')) fields.access_level_id = Number(fields.access_level_id);
    if (Object.hasOwn(fields, 'is_active')) fields.is_active = Boolean(fields.is_active);

    if (!fields.username || !fields.email || !Number.isInteger(fields.access_level_id)) {
      return Response.json({ error: 'שם משתמש, אימייל ותפקיד הם שדות חובה' }, { status: 400 });
    }
    if (id === Number(session.user_id) && fields.is_active === false) {
      return Response.json({ error: 'לא ניתן להשבית את המשתמש המחובר' }, { status: 400 });
    }
    if (id === Number(session.user_id)) {
      const levels = await getAccessLevels();
      const selectedLevel = levels.find((level) => Number(level.id) === fields.access_level_id);
      if (selectedLevel?.name !== 'admin') {
        return Response.json({ error: 'לא ניתן להסיר מעצמך הרשאת מנהל' }, { status: 400 });
      }
    }
    if (body.password && String(body.password).length < 8) {
      return Response.json({ error: 'הסיסמה חייבת להכיל לפחות 8 תווים' }, { status: 400 });
    }

    await updateUser(id, fields);
    if (body.password) {
      await changePassword(id, String(body.password));
    }
    return Response.json(await getUserById(id));
  } catch (error) {
    console.error('Failed to update user:', error);
    const duplicate = error?.code === '23505' || error?.code === 'ER_DUP_ENTRY';
    return Response.json(
      { error: duplicate ? 'שם המשתמש או כתובת האימייל כבר קיימים' : 'עדכון המשתמש נכשל' },
      { status: duplicate ? 409 : 500 }
    );
  }
}
