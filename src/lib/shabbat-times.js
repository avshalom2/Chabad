const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function israelDateKey(now = new Date()) {
  return israelDateFormatter.format(now);
}

export function showHomepageShabbat(now = new Date()) {
  const day = new Date(`${israelDateKey(now)}T12:00:00Z`).getUTCDay();
  return day === 4 || day === 5;
}

export async function getHebcalData(year = Number(israelDateKey().slice(0, 4))) {
  const url = new URL('https://www.hebcal.com/hebcal');
  url.search = new URLSearchParams({
    v: '1', cfg: 'json', year: String(year), month: 'x', maj: 'on', min: 'on',
    mod: 'on', nx: 'on', c: 'on', M: 'on', s: 'on',
    geo: 'geoname', geonameid: '293397', lg: 'h',
  }).toString();
  const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!response.ok) throw new Error('Failed to load Hebcal data');
  return response.json();
}

export function buildShabbatRows(items, today = israelDateKey()) {
  const key = value => String(value || '').slice(0, 10);
  const lookup = category => new Map(items.filter(item => item.category === category).map(item => [key(item.date), item]));
  const parashot = lookup('parashat');
  const endings = lookup('havdalah');
  const time = item => item?.date?.match(/T(\d{2}:\d{2})/)?.[1] || item?.title?.match(/(\d{1,2}:\d{2})/)?.[1] || null;
  const titles = ['שבת הקרובה', 'שבת הבאה', 'שבת בעוד שבועיים', 'שבת בעוד שלושה שבועות', 'שבת בעוד ארבעה שבועות', 'שבת בעוד חמישה שבועות', 'שבת בעוד שישה שבועות'];
  return items.filter(item => item.category === 'candles' && key(item.date) >= today).map(candles => {
    const date = new Date(`${key(candles.date)}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    const shabbatDate = date.toISOString().slice(0, 10);
    const parashah = parashot.get(shabbatDate);
    if (date.getUTCDay() !== 6 || !parashah) return null;
    return {
      key: shabbatDate, date: shabbatDate,
      candleTime: time(candles), havdalahTime: time(endings.get(shabbatDate)),
      parashah: String(parashah.hebrew || candles.memo || 'שבת').replace(/[\u0591-\u05C7]/g, '').trim(),
    };
  }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date)).map((row, index) => ({ ...row, title: titles[index] || `שבת בעוד ${index + 1} שבועות` }));
}
