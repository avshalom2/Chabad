import { getCachedStoreHours } from '@/lib/store-hours-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json({ storeHours: await getCachedStoreHours() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching store hours:', error);
    return Response.json({ error: 'Failed to fetch store hours' }, { status: 500 });
  }
}
