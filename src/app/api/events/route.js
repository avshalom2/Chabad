import { getCombinedEventsForDate } from '@/lib/events.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (date) {
      // Single date query
      const events = await getCombinedEventsForDate(date);
      return Response.json(events);
    } else if (year && month) {
      // Month query (for calendar markers)
      const { getCombinedEventsForMonth } = await import('@/lib/events.js');
      const events = await getCombinedEventsForMonth(parseInt(year), parseInt(month));
      return Response.json(events);
    } else {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
