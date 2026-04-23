import { deleteRecurringEvent, updateRecurringEvent, toggleRecurringEventStatus } from '@/lib/events.js';

// DELETE - Delete a recurring event
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteRecurringEvent(id);

    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Recurring event not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting recurring event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a recurring event
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const success = await updateRecurringEvent(id, body);

    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Recurring event not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating recurring event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Toggle recurring event status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const success = await toggleRecurringEventStatus(id);

    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Recurring event not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error toggling recurring event status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
