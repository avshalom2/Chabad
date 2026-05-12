import { getPool } from './db.js';

const DEFAULT_SCHEDULE = {
  parasha_name: '',
  hebrew_date_from: '',
  hebrew_date_to: '',
  hebrew_month: '',
  gregorian_date_from: '',
  gregorian_date_to: '',
  times: [],
};

const DEFAULT_TIMES = [
  { prayer_type: 'shacharit', day_group: 'sun_thu', time_value: '08:00', note: '', sort_order: 0 },
  { prayer_type: 'shacharit', day_group: 'sun_thu', time_value: '09:00', note: '', sort_order: 1 },
  { prayer_type: 'shacharit', day_group: 'friday', time_value: '08:30', note: 'בלבד', sort_order: 0 },
  { prayer_type: 'mincha', day_group: 'sun_thu', time_value: '13:20', note: '', sort_order: 0 },
  { prayer_type: 'mincha', day_group: 'sun_thu', time_value: '14:00', note: '', sort_order: 1 },
  { prayer_type: 'mincha', day_group: 'sun_thu', time_value: '15:15', note: '', sort_order: 2 },
  { prayer_type: 'mincha', day_group: 'sun_thu', time_value: '17:00', note: '', sort_order: 3 },
  { prayer_type: 'mincha', day_group: 'sunset', time_value: '19:18', note: '', sort_order: 0 },
  { prayer_type: 'mincha', day_group: 'friday', time_value: '13:20', note: 'בלבד', sort_order: 0 },
  { prayer_type: 'maariv', day_group: 'sun_thu', time_value: '20:01', note: '', sort_order: 0 },
];

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

function adaptPlaceholders(query, params = []) {
  if (!isPostgres()) return [query, params];

  let idx = 0;
  return [query.replace(/\?/g, () => `$${++idx}`), params];
}

function rowsFromResult(result) {
  return Array.isArray(result) ? result[0] : result.rows;
}

function writeResultFromResult(result) {
  return Array.isArray(result) ? result[0] : result;
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

function normalizeScheduleRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    parasha_name: row.parasha_name || '',
    hebrew_date_from: row.hebrew_date_from || '',
    hebrew_date_to: row.hebrew_date_to || '',
    hebrew_month: row.hebrew_month || '',
    gregorian_date_from: row.gregorian_date_from ? String(row.gregorian_date_from).slice(0, 10) : '',
    gregorian_date_to: row.gregorian_date_to ? String(row.gregorian_date_to).slice(0, 10) : '',
    updated_at: row.updated_at,
  };
}

function normalizeTime(row) {
  return {
    id: row.id,
    prayer_type: row.prayer_type,
    day_group: row.day_group,
    time_value: String(row.time_value || '').slice(0, 5),
    note: row.note || '',
    sort_order: Number(row.sort_order || 0),
  };
}

function normalizeTimes(times) {
  if (!Array.isArray(times)) return [];

  return times
    .map((time, index) => ({
      prayer_type: String(time.prayer_type || '').trim(),
      day_group: String(time.day_group || '').trim(),
      time_value: String(time.time_value || '').trim().slice(0, 5),
      note: String(time.note || '').trim(),
      sort_order: Number.isFinite(Number(time.sort_order)) ? Number(time.sort_order) : index,
    }))
    .filter((time) => time.prayer_type && time.day_group && /^\d{2}:\d{2}$/.test(time.time_value));
}

export function getDefaultWeeklyPrayerSchedule() {
  return {
    ...DEFAULT_SCHEDULE,
    times: DEFAULT_TIMES,
  };
}

export async function getWeeklyPrayerSchedule() {
  const schedules = await queryRows(
    'SELECT * FROM weekly_prayer_schedule ORDER BY id ASC LIMIT 1'
  );

  const schedule = normalizeScheduleRow(schedules[0]);
  if (!schedule) return getDefaultWeeklyPrayerSchedule();

  const times = await queryRows(
    `SELECT * FROM weekly_prayer_times
     WHERE schedule_id = ?
     ORDER BY prayer_type, day_group, sort_order, time_value`,
    [schedule.id]
  );

  return {
    ...schedule,
    times: times.map(normalizeTime),
  };
}

export async function saveWeeklyPrayerSchedule(data) {
  const schedules = await queryRows(
    'SELECT id FROM weekly_prayer_schedule ORDER BY id ASC LIMIT 1'
  );

  const fields = {
    parasha_name: String(data.parasha_name || '').trim(),
    hebrew_date_from: String(data.hebrew_date_from || '').trim(),
    hebrew_date_to: String(data.hebrew_date_to || '').trim(),
    hebrew_month: String(data.hebrew_month || '').trim(),
    gregorian_date_from: data.gregorian_date_from || null,
    gregorian_date_to: data.gregorian_date_to || null,
  };

  let scheduleId = schedules[0]?.id;

  if (scheduleId) {
    await queryWrite(
      `UPDATE weekly_prayer_schedule
       SET parasha_name = ?, hebrew_date_from = ?, hebrew_date_to = ?, hebrew_month = ?,
           gregorian_date_from = ?, gregorian_date_to = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        fields.parasha_name,
        fields.hebrew_date_from,
        fields.hebrew_date_to,
        fields.hebrew_month,
        fields.gregorian_date_from,
        fields.gregorian_date_to,
        scheduleId,
      ]
    );
  } else {
    const result = await queryWrite(
      `INSERT INTO weekly_prayer_schedule
       (parasha_name, hebrew_date_from, hebrew_date_to, hebrew_month, gregorian_date_from, gregorian_date_to)
       VALUES (?, ?, ?, ?, ?, ?)${isPostgres() ? ' RETURNING id' : ''}`,
      [
        fields.parasha_name,
        fields.hebrew_date_from,
        fields.hebrew_date_to,
        fields.hebrew_month,
        fields.gregorian_date_from,
        fields.gregorian_date_to,
      ]
    );

    scheduleId = result.insertId || result.rows?.[0]?.id;
  }

  const times = normalizeTimes(data.times);
  await queryWrite('DELETE FROM weekly_prayer_times WHERE schedule_id = ?', [scheduleId]);

  for (const time of times) {
    await queryWrite(
      `INSERT INTO weekly_prayer_times
       (schedule_id, prayer_type, day_group, time_value, note, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        scheduleId,
        time.prayer_type,
        time.day_group,
        time.time_value,
        time.note,
        time.sort_order,
      ]
    );
  }

  return getWeeklyPrayerSchedule();
}

export async function clearWeeklyPrayerSchedule() {
  const schedules = await queryRows(
    'SELECT id FROM weekly_prayer_schedule ORDER BY id ASC LIMIT 1'
  );
  const scheduleId = schedules[0]?.id;

  if (!scheduleId) return getDefaultWeeklyPrayerSchedule();

  await queryWrite('DELETE FROM weekly_prayer_times WHERE schedule_id = ?', [scheduleId]);
  await queryWrite('DELETE FROM weekly_prayer_schedule WHERE id = ?', [scheduleId]);

  return getDefaultWeeklyPrayerSchedule();
}
