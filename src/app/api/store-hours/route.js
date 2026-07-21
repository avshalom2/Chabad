import { getSetting } from '@/lib/settings';

export async function GET() {
  try {
    return Response.json({ storeHours: await getSetting('store_hours') });
  } catch (error) {
    console.error('Error fetching store hours:', error);
    return Response.json({ error: 'Failed to fetch store hours' }, { status: 500 });
  }
}
