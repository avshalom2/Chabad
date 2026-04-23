import { getCombinedEventsForMonth } from '@/lib/events.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return Response.json({ error: 'Missing year or month' }, { status: 400 });
    }

    const events = await getCombinedEventsForMonth(parseInt(year), parseInt(month));
    return Response.json(events);
  } catch (error) {
    console.error('Error fetching month events:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
