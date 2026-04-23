import { getPool } from './db.js';

/**
 * Get all events for a specific date
 */
export async function getEventsByDate(date) {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM events WHERE event_date = ? ORDER BY event_time ASC',
    [date]
  );
  return rows;
}

/**
 * Get events for a date range
 */
export async function getEventsByDateRange(startDate, endDate) {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM events WHERE event_date BETWEEN ? AND ? ORDER BY event_date, event_time ASC',
    [startDate, endDate]
  );
  return rows;
}

/**
 * Get all active recurring events
 */
export async function getActiveRecurringEvents() {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM recurring_events WHERE is_active = 1 ORDER BY event_time ASC'
  );
  return rows;
}

/**
 * Get recurring events for a specific day of week (0=Sunday, 6=Saturday)
 */
export async function getRecurringEventsByDayOfWeek(dayOfWeek) {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM recurring_events WHERE is_active = 1'
  );
  // Filter by day of week in JavaScript
  return rows.filter(event => {
    try {
      const days = Array.isArray(event.days_of_week) 
        ? event.days_of_week 
        : JSON.parse(event.days_of_week);
      return days.includes(dayOfWeek);
    } catch (e) {
      console.error('Error parsing days_of_week:', event.days_of_week, e);
      return false;
    }
  });
}

/**
 * Combine events and recurring events for a specific date
 */
export async function getCombinedEventsForDate(date) {
  // Get one-time events
  const events = await getEventsByDate(date);
  
  // Get recurring events for this day of week
  const dayOfWeek = new Date(date).getDay();
  const recurring = await getRecurringEventsByDayOfWeek(dayOfWeek);
  
  // Convert recurring events to event format for this date
  const recurringForDate = recurring.map(r => ({
    id: `recurring_${r.id}`,
    title: r.title,
    description: r.description,
    event_type: r.event_type,
    event_date: date,
    event_time: r.event_time,
    location: r.location,
    is_recurring: true,
    recurring_id: r.id
  }));
  
  // Combine and sort by time
  const combined = [...events, ...recurringForDate].sort((a, b) => {
    return a.event_time.localeCompare(b.event_time);
  });
  
  return combined;
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  const { title, description, event_type, event_date, event_time, location, created_by } = eventData;
  
  const [result] = await pool.query(
    `INSERT INTO events (title, description, event_type, event_date, event_time, location, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, event_type, event_date, event_time, location, created_by]
  );
  
  return result.insertId;
}

/**
 * Create a new recurring event
 */
export async function createRecurringEvent(eventData) {
  const { title, description, event_type, event_time, location, days_of_week, is_active, created_by } = eventData;
  
  const [result] = await pool.query(
    `INSERT INTO recurring_events (title, description, event_type, event_time, location, days_of_week, created_by, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, event_type, event_time, location, JSON.stringify(days_of_week), created_by, is_active ? 1 : 0]
  );
  
  return result.insertId;
}

/**
 * Update an event
 */
export async function updateEvent(eventId, eventData) {
  const { title, description, event_type, event_date, event_time, location } = eventData;
  
  const [result] = await pool.query(
    `UPDATE events SET title = ?, description = ?, event_type = ?, event_date = ?, event_time = ?, location = ?, updated_at = NOW()
     WHERE id = ?`,
    [title, description, event_type, event_date, event_time, location, eventId]
  );
  
  return result.affectedRows > 0;
}

/**
 * Update a recurring event
 */
export async function updateRecurringEvent(recurringId, eventData) {
  const { title, description, event_type, event_time, location, days_of_week, is_active } = eventData;
  
  const daysJson = JSON.stringify(days_of_week);
  
  const [result] = await pool.query(
    `UPDATE recurring_events SET title = ?, description = ?, event_type = ?, event_time = ?, location = ?, days_of_week = ?, is_active = ?, updated_at = NOW()
     WHERE id = ?`,
    [title, description, event_type, event_time, location, daysJson, is_active ? 1 : 0, recurringId]
  );
  
  return result.affectedRows > 0;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId) {
  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
  return result.affectedRows > 0;
}

/**
 * Delete a recurring event
 */
export async function deleteRecurringEvent(recurringId) {
  const [result] = await pool.query('DELETE FROM recurring_events WHERE id = ?', [recurringId]);
  return result.affectedRows > 0;
}

/**
 * Toggle recurring event active status
 */
export async function toggleRecurringEventStatus(recurringId) {
  const [result] = await pool.query(
    'UPDATE recurring_events SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?',
    [recurringId]
  );
  return result.affectedRows > 0;
}

/**
 * Get all events (for admin listing)
 */
export async function getAllEvents() {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date DESC, event_time DESC');
  return rows;
}

/**
 * Get all recurring events (for admin listing)
 */
export async function getAllRecurringEvents() {
  const [rows] = await pool.query('SELECT * FROM recurring_events ORDER BY event_time ASC');
  return rows;
}

/**
 * Get combined events for a month (used for calendar markers)
 */
export async function getCombinedEventsForMonth(year, month) {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  const [events] = await pool.query(
    'SELECT DISTINCT DATE(event_date) as event_date FROM events WHERE event_date BETWEEN ? AND ?',
    [startDate, endDate]
  );
  
  return events;
}
