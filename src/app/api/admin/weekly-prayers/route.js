import {
  clearWeeklyPrayerSchedule,
  getWeeklyPrayerSchedule,
  saveWeeklyPrayerSchedule,
} from '@/lib/weekly-prayers.js';

export async function GET() {
  try {
    const schedule = await getWeeklyPrayerSchedule();
    return Response.json({ schedule });
  } catch (error) {
    console.error('Error fetching weekly prayer schedule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const schedule = await saveWeeklyPrayerSchedule(body);
    return Response.json({ success: true, schedule });
  } catch (error) {
    console.error('Error saving weekly prayer schedule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const schedule = await clearWeeklyPrayerSchedule();
    return Response.json({ success: true, schedule });
  } catch (error) {
    console.error('Error clearing weekly prayer schedule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
