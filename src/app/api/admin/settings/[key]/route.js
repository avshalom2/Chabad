/**
 * PUT /api/admin/settings/[key]
 * Update a specific site setting
 */
import { setSetting } from '@/lib/settings';
import { getCurrentUserSession } from '@/lib/auth-session';

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    const body = await request.json();
    const { value } = body;

    if (!key || value === undefined) {
      return Response.json({ error: 'Missing key or value' }, { status: 400 });
    }

    await setSetting(key, value);
    return Response.json({ success: true, message: `Setting "${key}" updated` });
  } catch (err) {
    console.error('Error updating setting:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
