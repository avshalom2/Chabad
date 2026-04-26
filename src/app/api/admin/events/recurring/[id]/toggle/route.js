import { toggleRecurringEventStatus } from '@/lib/events.js';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const success = await toggleRecurringEventStatus(id);

    if (!success) {
      return Response.json({ error: 'Recurring event not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error toggling recurring event status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
