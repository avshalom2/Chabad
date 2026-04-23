import { deleteEvent, updateEvent } from '@/lib/events.js';

// DELETE - Delete a single event
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteEvent(id);

    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a single event
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const success = await updateEvent(id, body);

    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
