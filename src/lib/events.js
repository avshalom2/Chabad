import { getPool } from './db.js';

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

function adaptPlaceholders(query, params = []) {
  if (!isPostgres()) return [query, params];

  let idx = 0;
  return [
    query.replace(/\?/g, () => `$${++idx}`),
    params,
  ];
}

function rowsFromResult(result) {
  return Array.isArray(result) ? result[0] : result.rows;
}

function writeResultFromResult(result) {
  return Array.isArray(result) ? result[0] : result;
}

function affectedRows(result) {
  return result.affectedRows ?? result.rowCount ?? 0;
}

async function queryRows(query, params = []) {
  const pool = await getPool();
  const [sql, values] = adaptPlaceholders(query, params);
  return rowsFromResult(await pool.query(sql, values));
}

async function queryWrite(query, params = []) {
  const pool = await getPool();
  const [sql, values] = adaptPlaceholders(query, params);
  return writeResultFromResult(await pool.query(sql, values));
}

function normalizeDaysOfWeek(days) {
  if (Array.isArray(days)) return days;
  if (typeof days === 'string') {
    try {
      const parsed = JSON.parse(days);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Get all events for a specific date
 */
export async function getEventsByDate(date) {
  return queryRows(
    'SELECT * FROM events WHERE event_date = ? ORDER BY event_time ASC',
    [date]
  );
}

/**
 * Get events for a date range
 */
export async function getEventsByDateRange(startDate, endDate) {
  return queryRows(
    'SELECT * FROM events WHERE event_date BETWEEN ? AND ? ORDER BY event_date, event_time ASC',
    [startDate, endDate]
  );
}

/**
 * Get all active recurring events
 */
export async function getActiveRecurringEvents() {
  return queryRows(
    `SELECT * FROM recurring_events WHERE is_active = ${isPostgres() ? 'TRUE' : '1'} ORDER BY event_time ASC`
  );
}

/**
 * Get recurring events for a specific day of week (0=Sunday, 6=Saturday)
 */
export async function getRecurringEventsByDayOfWeek(dayOfWeek) {
  const rows = await queryRows(
    `SELECT * FROM recurring_events WHERE is_active = ${isPostgres() ? 'TRUE' : '1'}`
  );

  return rows.filter(event => normalizeDaysOfWeek(event.days_of_week).includes(dayOfWeek));
}

/**
 * Combine events and recurring events for a specific date
 */
export async function getCombinedEventsForDate(date) {
  const events = await getEventsByDate(date);
  const dayOfWeek = new Date(date).getDay();
  const recurring = await getRecurringEventsByDayOfWeek(dayOfWeek);

  const recurringForDate = recurring.map(r => ({
    id: `recurring_${r.id}`,
    title: r.title,
    description: r.description,
    event_type: r.event_type,
    event_date: date,
    event_time: r.event_time,
    location: r.location,
    is_recurring: true,
    recurring_id: r.id,
  }));

  return [...events, ...recurringForDate].sort((a, b) => {
    return String(a.event_time).localeCompare(String(b.event_time));
  });
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  const { title, description, event_type, event_date, event_time, location, created_by } = eventData;

  const result = await queryWrite(
    `INSERT INTO events (title, description, event_type, event_date, event_time, location, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)${isPostgres() ? ' RETURNING id' : ''}`,
    [title, description, event_type, event_date, event_time, location, created_by]
  );

  return result.insertId || result.rows?.[0]?.id;
}

/**
 * Create a new recurring event
 */
export async function createRecurringEvent(eventData) {
  const { title, description, event_type, event_time, location, days_of_week, is_active, created_by } = eventData;
  const daysJson = JSON.stringify(normalizeDaysOfWeek(days_of_week));
  const daysColumnValue = isPostgres() ? '?::jsonb' : '?';

  const result = await queryWrite(
    `INSERT INTO recurring_events (title, description, event_type, event_time, location, days_of_week, created_by, is_active)
     VALUES (?, ?, ?, ?, ?, ${daysColumnValue}, ?, ?)${isPostgres() ? ' RETURNING id' : ''}`,
    [title, description, event_type, event_time, location, daysJson, created_by, is_active !== false]
  );

  return result.insertId || result.rows?.[0]?.id;
}

/**
 * Update an event
 */
export async function updateEvent(eventId, eventData) {
  const { title, description, event_type, event_date, event_time, location } = eventData;

  const result = await queryWrite(
    `UPDATE events SET title = ?, description = ?, event_type = ?, event_date = ?, event_time = ?, location = ?, updated_at = NOW()
     WHERE id = ?`,
    [title, description, event_type, event_date, event_time, location, eventId]
  );

  return affectedRows(result) > 0;
}

/**
 * Update a recurring event
 */
export async function updateRecurringEvent(recurringId, eventData) {
  const { title, description, event_type, event_time, location, days_of_week, is_active } = eventData;
  const daysJson = JSON.stringify(normalizeDaysOfWeek(days_of_week));
  const daysColumnValue = isPostgres() ? '?::jsonb' : '?';

  const result = await queryWrite(
    `UPDATE recurring_events SET title = ?, description = ?, event_type = ?, event_time = ?, location = ?, days_of_week = ${daysColumnValue}, is_active = ?, updated_at = NOW()
     WHERE id = ?`,
    [title, description, event_type, event_time, location, daysJson, is_active !== false, recurringId]
  );

  return affectedRows(result) > 0;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId) {
  const result = await queryWrite('DELETE FROM events WHERE id = ?', [eventId]);
  return affectedRows(result) > 0;
}

/**
 * Delete a recurring event
 */
export async function deleteRecurringEvent(recurringId) {
  const result = await queryWrite('DELETE FROM recurring_events WHERE id = ?', [recurringId]);
  return affectedRows(result) > 0;
}

/**
 * Toggle recurring event active status
 */
export async function toggleRecurringEventStatus(recurringId) {
  const result = await queryWrite(
    'UPDATE recurring_events SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?',
    [recurringId]
  );
  return affectedRows(result) > 0;
}

/**
 * Get all events (for admin listing)
 */
export async function getAllEvents() {
  return queryRows('SELECT * FROM events ORDER BY event_date DESC, event_time DESC');
}

/**
 * Get all recurring events (for admin listing)
 */
export async function getAllRecurringEvents() {
  return queryRows('SELECT * FROM recurring_events ORDER BY event_time ASC');
}

/**
 * Get combined events for a month (used for calendar markers)
 */
export async function getCombinedEventsForMonth(year, month) {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  return queryRows(
    'SELECT DISTINCT DATE(event_date) as event_date FROM events WHERE event_date BETWEEN ? AND ?',
    [startDate, endDate]
  );
}
