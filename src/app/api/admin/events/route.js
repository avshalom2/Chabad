import { createEvent, createRecurringEvent, getAllEvents, getAllRecurringEvents, deleteEvent, deleteRecurringEvent, toggleRecurringEventStatus, updateEvent, updateRecurringEvent } from '@/lib/events.js';

// GET - Fetch all events
export async function GET(request) {
  try {
    const events = await getAllEvents();
    const recurringEvents = await getAllRecurringEvents();
    
    return Response.json({
      events,
      recurringEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, title, description, event_type, event_date, event_time, location, days_of_week, is_active } = body;

    // Get user ID from session (you may need to adjust this based on your auth setup)
    // For now, we'll use a default admin user ID
    const userId = 1; // TODO: Get from authenticated session

    if (type === 'single') {
      const eventId = await createEvent({
        title,
        description,
        event_type,
        event_date,
        event_time,
        location,
        created_by: userId
      });

      return Response.json({ success: true, eventId }, { status: 201 });
    } else if (type === 'recurring') {
      const eventId = await createRecurringEvent({
        title,
        description,
        event_type,
        event_time,
        location,
        days_of_week,
        is_active: is_active !== false,
        created_by: userId
      });

      return Response.json({ success: true, eventId }, { status: 201 });
    }

    return Response.json({ error: 'Invalid event type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
