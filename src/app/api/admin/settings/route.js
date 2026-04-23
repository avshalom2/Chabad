/**
 * GET /api/admin/settings
 * Fetch all site settings or specific keys
 * Query params: ?keys=key1,key2 (optional)
 */
import { getSetting, getSettings, getAllSettings } from '@/lib/settings';
import { getCurrentUserSession } from '@/lib/auth-session';

export async function GET(request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get('keys');

    let settings;
    if (keysParam) {
      const keys = keysParam.split(',').map(k => k.trim());
      settings = await getSettings(keys);
    } else {
      settings = await getAllSettings();
    }

    return Response.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
