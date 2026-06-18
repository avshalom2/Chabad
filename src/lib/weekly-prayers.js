import { getPool } from './db.js';

const ZMANIM_API_BASE_URL = 'https://www.hebcal.com/zmanim';
const SHABBAT_API_BASE_URL = 'https://www.hebcal.com/shabbat';
const CONVERTER_API_BASE_URL = 'https://www.hebcal.com/converter';
const SHABBAT_SOURCE_VERSION = 'shabbat-city-tel-aviv-v2-explicit-date';
const HEBREW_DATE_SOURCE_VERSION = 'hebcal-converter-v2';
const ZMANIM_LOCATION = {
  latitude: '32.1663',
  longitude: '34.8439',
  tzid: 'Asia/Jerusalem',
};
const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

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
    gregorian_date_from: normalizeDateKey(row.gregorian_date_from),
    gregorian_date_to: normalizeDateKey(row.gregorian_date_to),
    zmanim_week_start: normalizeDateKey(row.zmanim_week_start),
    zmanim_week_end: normalizeDateKey(row.zmanim_week_end),
    zmanim_data: normalizeZmanimData(row.zmanim_data),
    zmanim_updated_at: row.zmanim_updated_at,
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
    .filter((time) => !time.is_calculated)
    .map((time, index) => ({
      prayer_type: String(time.prayer_type || '').trim(),
      day_group: String(time.day_group || '').trim(),
      time_value: String(time.time_value || '').trim().slice(0, 5),
      note: String(time.note || '').trim(),
      sort_order: Number.isFinite(Number(time.sort_order)) ? Number(time.sort_order) : index,
    }))
    .filter((time) => time.prayer_type && time.day_group && /^\d{2}:\d{2}$/.test(time.time_value));
}

function parseDateOnly(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeZmanimData(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeDateKey(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateInIsrael(value);
  }

  const text = String(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function formatDateInIsrael(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function compareDateKeys(a, b) {
  return String(a || '').localeCompare(String(b || ''));
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getIsraelDate() {
  return parseDateOnly(formatDateInIsrael(new Date()));
}

function getSundayToFridayRange(baseDate = getIsraelDate()) {
  const day = baseDate.getDay();
  const sunday = addDays(baseDate, -day);

  return {
    start: sunday,
    end: addDays(sunday, 5),
  };
}

function datesBetween(start, end) {
  const dates = [];
  let current = new Date(start);

  while (current <= end && dates.length < 14) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

function scheduleCalculationDates(schedule) {
  const from = parseDateOnly(schedule.zmanim_week_start || schedule.gregorian_date_from);
  const to = parseDateOnly(schedule.zmanim_week_end || schedule.gregorian_date_to);
  const dates = from && to && from <= to
    ? datesBetween(from, to)
    : datesBetween(new Date(), addDays(new Date(), 6));

  const sunThuDates = dates.filter((date) => {
    const day = date.getDay();
    return day >= 0 && day <= 4;
  });

  return sunThuDates.length ? sunThuDates : dates;
}

function scheduleBaseDate(schedule) {
  return (
    parseDateOnly(schedule.zmanim_week_start) ||
    parseDateOnly(schedule.gregorian_date_from) ||
    getSundayToFridayRange().start
  );
}

function cleanHebrewText(text) {
  return String(text || '').replace(/[\u0591-\u05C7]/g, '').trim();
}

function normalizeParashaName(text) {
  return cleanHebrewText(text).replace(/^פרשת\s+/, '').trim();
}

function stripHebrewYear(text) {
  return cleanHebrewText(text).replace(/\s+תש[\u05D0-\u05EA"״׳']+$/, '').trim();
}

function splitHebrewDate(text) {
  const clean = stripHebrewYear(text);
  const match = clean.match(/^(.+?)\s+([^\s]+)$/);
  const day = match ? match[1].trim() : clean;
  const month = match ? match[2].trim().replace(/^ב(?=[\u05D0-\u05EA])/, '') : '';

  return {
    day,
    month,
    text: month ? `${day} ${month}` : clean,
  };
}

function compactHebrewDateRange(fromDate, toDate) {
  if (!fromDate?.text || !toDate?.text) return null;

  const sameMonth = fromDate.month && fromDate.month === toDate.month;
  const text = sameMonth
    ? `${fromDate.day}-${toDate.day} ${fromDate.month}`
    : `${fromDate.text} - ${toDate.text}`;

  return {
    source: HEBREW_DATE_SOURCE_VERSION,
    from: fromDate.text,
    to: toDate.text,
    from_day: fromDate.day,
    to_day: toDate.day,
    month: sameMonth ? fromDate.month : '',
    text,
  };
}

function minutesFromDate(date) {
  return (date.getHours() * 60) + date.getMinutes() + (date.getSeconds() >= 30 ? 1 : 0);
}

function minutesFromTimeString(value) {
  const match = String(value || '').match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  return (Number(match[1]) * 60) + Number(match[2]) + (Number(match[3] || 0) >= 30 ? 1 : 0);
}

function formatTimeFromMinutes(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function fetchZmanimForDate(date) {
  const url = new URL(ZMANIM_API_BASE_URL);
  url.search = new URLSearchParams({
    cfg: 'json',
    latitude: ZMANIM_LOCATION.latitude,
    longitude: ZMANIM_LOCATION.longitude,
    tzid: ZMANIM_LOCATION.tzid,
    date: dateKey(date),
  }).toString();

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!response.ok) {
    throw new Error(`Hebcal zmanim request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchShabbatInfo(targetDate = getIsraelDate()) {
  const url = new URL(SHABBAT_API_BASE_URL);
  url.search = new URLSearchParams({
    cfg: 'json',
    city: 'Tel Aviv',
    gy: String(targetDate.getFullYear()),
    gm: String(targetDate.getMonth() + 1),
    gd: String(targetDate.getDate()),
  }).toString();

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!response.ok) {
    throw new Error(`Hebcal shabbat request failed: ${response.status}`);
  }

  const data = await response.json();
  const parashat = (data.items || []).find((item) => item.category === 'parashat');
  const candles = (data.items || []).find((item) => item.category === 'candles');
  const havdalah = (data.items || []).find((item) => item.category === 'havdalah');

  return {
    source: SHABBAT_SOURCE_VERSION,
    data,
    parasha_name: normalizeParashaName(parashat?.hebrew || parashat?.title || candles?.memo),
    parasha_full: cleanHebrewText(parashat?.hebrew || parashat?.title || candles?.memo),
    candles: candles?.date || '',
    havdalah: havdalah?.date || '',
  };
}

async function fetchHebrewDate(date) {
  const url = new URL(CONVERTER_API_BASE_URL);
  url.search = new URLSearchParams({
    cfg: 'json',
    g2h: '1',
    gy: String(date.getFullYear()),
    gm: String(date.getMonth() + 1),
    gd: String(date.getDate()),
  }).toString();

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!response.ok) {
    throw new Error(`Hebcal converter request failed: ${response.status}`);
  }

  const data = await response.json();
  return splitHebrewDate(data.hebrew);
}

async function fetchHebrewDateRange(start, end) {
  const [from, to] = await Promise.all([
    fetchHebrewDate(start),
    fetchHebrewDate(end),
  ]);

  return compactHebrewDateRange(from, to);
}

async function getSunsetMinutesFromHebcal(date) {
  const data = await fetchZmanimForDate(date);
  return sunsetMinutesFromZmanimData(data, dateKey(date));
}

function sunsetMinutesFromZmanimData(data, fallbackDate = '') {
  const sunset = data?.times?.sunset;
  if (!sunset) {
    throw new Error(`Hebcal zmanim response missing sunset for ${fallbackDate}`);
  }

  const localMinutes = minutesFromTimeString(sunset);
  if (localMinutes !== null) return localMinutes;

  return minutesFromDate(new Date(sunset));
}

function cachedZmanimIsCurrent(schedule, todayKey = dateKey(getIsraelDate())) {
  if (
    !schedule?.zmanim_week_start ||
    !schedule?.zmanim_week_end ||
    !schedule?.zmanim_data?.days ||
    !schedule?.zmanim_data?.shabbat?.parasha_name ||
    schedule?.zmanim_data?.shabbat?.source !== SHABBAT_SOURCE_VERSION ||
    schedule?.zmanim_data?.hebrew_date_range?.source !== HEBREW_DATE_SOURCE_VERSION
  ) {
    return false;
  }

  return (
    compareDateKeys(schedule.zmanim_week_start, todayKey) <= 0 &&
    compareDateKeys(todayKey, schedule.zmanim_week_end) <= 0
  );
}

async function buildWeeklyZmanimCache(baseDate = getIsraelDate()) {
  const { start, end } = getSundayToFridayRange(baseDate);
  const shabbatEnd = addDays(start, 6);
  const dates = datesBetween(start, end);
  const [days, shabbat, hebrewDateRange] = await Promise.all([
    Promise.all(dates.map(async (date) => ({
      date: dateKey(date),
      data: await fetchZmanimForDate(date),
    }))),
    fetchShabbatInfo(shabbatEnd),
    fetchHebrewDateRange(start, shabbatEnd),
  ]);

  return {
    weekStart: dateKey(start),
    weekEnd: dateKey(end),
    payload: {
      generated_at: new Date().toISOString(),
      location: ZMANIM_LOCATION,
      week_start: dateKey(start),
      week_end: dateKey(end),
      display_week_end: dateKey(shabbatEnd),
      hebrew_date_range: hebrewDateRange,
      shabbat,
      days,
    },
  };
}

async function persistWeeklyZmanimCache(scheduleId, cache) {
  if (!scheduleId) return;

  await queryWrite(
    `UPDATE weekly_prayer_schedule
     SET zmanim_week_start = ?, zmanim_week_end = ?, zmanim_data = ?,
         zmanim_updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [cache.weekStart, cache.weekEnd, JSON.stringify(cache.payload), scheduleId]
  );
}

async function ensureWeeklyZmanimCache(schedule) {
  const today = getIsraelDate();
  const todayKey = dateKey(today);
  if (cachedZmanimIsCurrent(schedule, todayKey)) {
    return schedule;
  }

  const cache = await buildWeeklyZmanimCache(today);
  await persistWeeklyZmanimCache(schedule.id, cache);

  return {
    ...schedule,
    zmanim_week_start: cache.weekStart,
    zmanim_week_end: cache.weekEnd,
    zmanim_data: cache.payload,
    zmanim_updated_at: new Date().toISOString(),
  };
}

function getCachedSunsetMinutes(schedule, date) {
  const key = dateKey(date);
  const day = schedule.zmanim_data?.days?.find((entry) => entry.date === key);
  if (!day) return null;

  return sunsetMinutesFromZmanimData(day.data, key);
}

async function calculateDynamicPrayerTimes(schedule) {
  try {
    const baseDate = scheduleBaseDate(schedule);

    const lockedSunset = (
      getCachedSunsetMinutes(schedule, baseDate) ??
      await getSunsetMinutesFromHebcal(baseDate)
    );
    const minchaBeforeSunset = lockedSunset - 10;
    const maariv = minchaBeforeSunset + 43;

    return {
      locked_sunset_date: dateKey(baseDate),
      locked_sunset: formatTimeFromMinutes(lockedSunset),
      average_sunset: formatTimeFromMinutes(lockedSunset),
      mincha_before_sunset: formatTimeFromMinutes(minchaBeforeSunset),
      maariv: formatTimeFromMinutes(maariv),
    };
  } catch (error) {
    console.error('Error calculating dynamic weekly prayer times:', error);
    return null;
  }
}

async function withDynamicPrayerTimes(schedule) {
  const scheduleWithZmanim = await ensureWeeklyZmanimCache(schedule);
  const dynamicTimes = await calculateDynamicPrayerTimes(scheduleWithZmanim);
  if (!dynamicTimes) return scheduleWithZmanim;
  const dynamicParasha = scheduleWithZmanim.zmanim_data?.shabbat?.parasha_name || '';
  const dynamicHebrewDateRange = scheduleWithZmanim.zmanim_data?.hebrew_date_range;

  const staticTimes = (schedule.times || []).filter((time) => {
    const isSunsetMincha = time.prayer_type === 'mincha' && time.day_group === 'sunset';
    const isMaariv = time.prayer_type === 'maariv' && time.day_group === 'sun_thu';
    return !isSunsetMincha && !isMaariv;
  });

  return {
    ...scheduleWithZmanim,
    parasha_name: dynamicParasha || scheduleWithZmanim.parasha_name,
    hebrew_date_from: dynamicHebrewDateRange?.from_day || scheduleWithZmanim.hebrew_date_from,
    hebrew_date_to: dynamicHebrewDateRange?.to_day || scheduleWithZmanim.hebrew_date_to,
    hebrew_month: dynamicHebrewDateRange?.month || scheduleWithZmanim.hebrew_month,
    hebrew_date_range_text: dynamicHebrewDateRange?.text || '',
    dynamic_parasha_name: dynamicParasha,
    dynamic_times: dynamicTimes,
    times: [
      ...staticTimes,
      {
        prayer_type: 'mincha',
        day_group: 'sunset',
        time_value: dynamicTimes.mincha_before_sunset,
        note: '',
        sort_order: 0,
        is_calculated: true,
      },
      {
        prayer_type: 'maariv',
        day_group: 'sun_thu',
        time_value: dynamicTimes.maariv,
        note: '',
        sort_order: 0,
        is_calculated: true,
      },
    ],
  };
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
  if (!schedule) return withDynamicPrayerTimes(getDefaultWeeklyPrayerSchedule());

  const times = await queryRows(
    `SELECT * FROM weekly_prayer_times
     WHERE schedule_id = ?
     ORDER BY prayer_type, day_group, sort_order, time_value`,
    [schedule.id]
  );

  return withDynamicPrayerTimes({
    ...schedule,
    times: times.map(normalizeTime),
  });
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

  if (!scheduleId) return withDynamicPrayerTimes(getDefaultWeeklyPrayerSchedule());

  await queryWrite('DELETE FROM weekly_prayer_times WHERE schedule_id = ?', [scheduleId]);
  await queryWrite('DELETE FROM weekly_prayer_schedule WHERE id = ?', [scheduleId]);

  return withDynamicPrayerTimes(getDefaultWeeklyPrayerSchedule());
}
