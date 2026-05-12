import { getWeeklyPrayerSchedule } from '@/lib/weekly-prayers.js';

export async function GET() {
  try {
    const schedule = await getWeeklyPrayerSchedule();
    return Response.json({ schedule });
  } catch (error) {
    console.error('Error fetching weekly prayer schedule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
