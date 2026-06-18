import { getWeeklyPrayerSchedule } from '@/lib/weekly-prayers.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const schedule = await getWeeklyPrayerSchedule();
    return Response.json(
      { schedule },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching weekly prayer schedule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
