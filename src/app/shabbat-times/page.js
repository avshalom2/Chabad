import Link from 'next/link';
import { HDate } from '@hebcal/core';
import styles from './shabbat-times.module.css';

const GEONAME_ID = '293397';
const CITY_HE = 'תל אביב - יפו';
const HEBREW_HOLIDAY_LABELS = {
  Pesach: 'פסח',
  Shavuot: 'שבועות',
  'Rosh Hashana': 'ראש השנה',
  'Yom Kippur': 'יום כיפור',
  Sukkot: 'סוכות',
  'Shmini Atzeret': 'שמיני עצרת',
  'Simchat Torah': 'שמחת תורה',
  Chanukah: 'חנוכה',
  Purim: 'פורים',
  "Tu BiShvat": 'ט"ו בשבט',
  "Lag BaOmer": 'ל"ג בעומר',
};

const HOLIDAY_ICONS = {
  Pesach: '🍷',
  Shavuot: '📜',
  'Rosh Hashana': '📯',
  'Yom Kippur': '🕯️',
  Sukkot: '🌿',
  'Shmini Atzeret': '📖',
  'Simchat Torah': '📖',
  Chanukah: '🕎',
  Purim: '🎭',
};

const UPCOMING_SHABBAT_TITLES = [
  'שבת הקרובה',
  'שבת הבאה',
  'שבת בעוד שבועיים',
  'שבת בעוד שלושה שבועות',
  'שבת בעוד ארבעה שבועות',
  'שבת בעוד חמישה שבועות',
  'שבת בעוד שישה שבועות',
];

export const metadata = {
  title: 'זמני שבת וחגים',
  description: 'זמני שבתות קרובות וחגי ישראל לפי תל אביב-יפו',
};

export const dynamic = 'force-dynamic';

async function getHebcalData() {
  const year = new Date().getFullYear();
  const url = new URL('https://www.hebcal.com/hebcal');
  url.search = new URLSearchParams({
    v: '1',
    cfg: 'json',
    year: String(year),
    month: 'x',
    maj: 'on',
    min: 'on',
    mod: 'on',
    nx: 'on',
    c: 'on',
    M: 'on',
    s: 'on',
    geo: 'geoname',
    geonameid: GEONAME_ID,
    lg: 'h',
  }).toString();

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!response.ok) {
    throw new Error('Failed to load Hebcal data');
  }

  return response.json();
}

function dateKey(value) {
  return String(value || '').slice(0, 10);
}

function addDaysKey(key, days) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function eventTime(item) {
  const fromDate = item?.date?.match(/T(\d{2}:\d{2})/);
  if (fromDate) return fromDate[1];
  const fromTitle = item?.title?.match(/(\d{1,2}:\d{2})/);
  return fromTitle ? fromTitle[1] : null;
}

function cleanHebrew(text) {
  return String(text || '').replace(/[\u0591-\u05C7]/g, '').trim();
}

function hebrewDate(value, withYear = false) {
  const date = new Date(`${dateKey(value)}T12:00:00`);
  return new HDate(date).renderGematriya(true, !withYear);
}

function gregorianDate(value) {
  const date = new Date(`${dateKey(value)}T12:00:00`);
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
  }).format(date);
}

function makeLookup(items, category) {
  return new Map(
    items
      .filter(item => item.category === category)
      .map(item => [dateKey(item.date), item])
  );
}

function buildShabbatRows(items) {
  const parashatByDate = makeLookup(items, 'parashat');
  const havdalahByDate = makeLookup(items, 'havdalah');
  const today = dateKey(new Date().toISOString());

  return items
    .filter(item => item.category === 'candles' && dateKey(item.date) >= today)
    .map(candles => {
      const shabbatDate = addDaysKey(dateKey(candles.date), 1);
      const parashah = parashatByDate.get(shabbatDate);
      const havdalah = havdalahByDate.get(shabbatDate);

      if (!parashah) return null;

      return {
        key: shabbatDate,
        date: shabbatDate,
        title: 'שבת הקרובה',
        candleTime: eventTime(candles),
        havdalahTime: eventTime(havdalah),
        parashah: cleanHebrew(parashah?.hebrew || candles.memo || 'שבת'),
      };
    })
    .filter(Boolean)
    .map((row, index) => ({
      ...row,
      title: UPCOMING_SHABBAT_TITLES[index] || `שבת בעוד ${index + 1} שבועות`,
    }));
}

function holidayBase(titleOrig = '') {
  return titleOrig
    .replace(/^Erev\s+/, '')
    .replace(/\s+\d+ Candles$/, '')
    .replace(/:\s.*$/, '')
    .replace(/\s+(I|II|III|IV|V|VI|VII|VIII)$/, '')
    .replace(/\s+\(CH''M\)$/, '')
    .trim();
}

function buildHolidayRows(items) {
  const today = dateKey(new Date().toISOString());
  const candlesByDate = makeLookup(items, 'candles');
  const havdalahByDate = makeLookup(items, 'havdalah');
  const seen = new Set();

  return items
    .filter(item => item.category === 'holiday' && item.subcat === 'major' && dateKey(item.date) >= today)
    .map(item => {
      const base = holidayBase(item.title_orig || item.title);
      if (!base || seen.has(base)) return null;
      seen.add(base);

      const key = dateKey(item.date);
      const previousDay = addDaysKey(key, -1);
      const candles = candlesByDate.get(key) || candlesByDate.get(previousDay);
      const havdalah = havdalahByDate.get(key) || havdalahByDate.get(addDaysKey(key, 1));

      return {
        key: `${base}-${key}`,
        date: key,
        title: HEBREW_HOLIDAY_LABELS[base] || cleanHebrew(item.hebrew || item.title),
        subtitle: cleanHebrew(item.hebrew || item.title),
        candleTime: eventTime(candles),
        havdalahTime: eventTime(havdalah),
        icon: HOLIDAY_ICONS[base] || '✡',
      };
    })
    .filter(Boolean);
}

function TimePair({ candleTime, havdalahTime, holiday = false }) {
  return (
    <div className={styles.timePair}>
      <div className={styles.timeCol}>
        <span>{holiday ? 'כניסת חג' : 'כניסת שבת'}</span>
        <strong>{candleTime || '--:--'}</strong>
      </div>
      <div className={styles.rowDivider} />
      <div className={styles.timeCol}>
        <span>{holiday ? 'יציאת חג' : 'יציאת שבת'}</span>
        <strong>{havdalahTime || '--:--'}</strong>
      </div>
    </div>
  );
}

function TimesRow({ item, holiday = false }) {
  return (
    <article className={styles.timesRow}>
      <div className={styles.rowTitle}>
        <h3>{item.title}</h3>
        <p>{item.parashah || item.subtitle}</p>
      </div>
      <div className={styles.timeCol}>
        <span>{holiday ? 'כניסה' : 'כניסה'}</span>
        <strong>{item.candleTime || '--:--'}</strong>
      </div>
      <div className={styles.timeCol}>
        <span>{holiday ? 'יציאה' : 'יציאה'}</span>
        <strong>{item.havdalahTime || '--:--'}</strong>
      </div>
      {holiday && <div className={styles.iconBox} aria-hidden="true">{item.icon}</div>}
      <div className={styles.dateBlock}>
        <strong>{gregorianDate(item.date)}</strong>
        <span>{hebrewDate(item.date)}</span>
      </div>
    </article>
  );
}

export default async function ShabbatTimesPage() {
  const data = await getHebcalData();
  const shabbatRows = buildShabbatRows(data.items || []);
  const holidayRows = buildHolidayRows(data.items || []);
  const featured = shabbatRows[0];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {featured && (
          <section className={styles.featuredCard}>
            <div className={styles.featuredContent}>
              <span className={styles.badge}>★ שבת הקרובה</span>
              <h2>{featured.parashah}</h2>
              <TimePair candleTime={featured.candleTime} havdalahTime={featured.havdalahTime} />
              <p>{hebrewDate(featured.date, true)} · {gregorianDate(featured.date)}</p>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>שבתות קרובות</h2>
          </div>
          <div className={styles.list}>
            {shabbatRows.slice(1, 5).map(item => (
              <TimesRow key={item.key} item={item} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>זמני חגים</h2>
          </div>
          <div className={styles.list}>
            {holidayRows.slice(0, 5).map(item => (
              <TimesRow key={item.key} item={item} holiday />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
