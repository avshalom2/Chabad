import assert from 'node:assert/strict';
import { buildShabbatRows, getHebcalData, israelDateKey, showHomepageShabbat } from '../src/lib/shabbat-times.js';

assert.equal(israelDateKey(new Date('2026-10-07T21:30:00Z')), '2026-10-08');
assert.equal(showHomepageShabbat(new Date('2026-10-07T21:30:00Z')), true, 'Thursday in Israel');
assert.equal(showHomepageShabbat(new Date('2026-10-09T20:59:00Z')), true, 'Friday in Israel');
assert.equal(showHomepageShabbat(new Date('2026-10-09T21:00:00Z')), false, 'Hide at Israeli Saturday midnight');
for (const day of [4, 5, 6, 7, 10]) {
  assert.equal(showHomepageShabbat(new Date(`2026-10-${String(day).padStart(2, '0')}T12:00:00Z`)), false);
}

const items = [
  { category: 'candles', date: '2026-10-08T17:50:00+03:00' }, // Holiday candles must not be selected.
  { category: 'candles', date: '2026-10-09T17:55:00+03:00' },
  { category: 'parashat', date: '2026-10-10', hebrew: 'פָּרָשַׁת בְּרֵאשִׁית' },
  { category: 'havdalah', date: '2026-10-10T18:51:00+03:00' },
];
const rows = buildShabbatRows(items, '2026-10-08');
assert.equal(rows.length, 1);
assert.equal(rows[0].date, '2026-10-10');
assert.equal(rows[0].parashah, 'פרשת בראשית');
assert.equal(rows[0].candleTime, '17:55');
assert.equal(rows[0].havdalahTime, '18:51');
assert.equal(buildShabbatRows(items, '2026-10-11').length, 0);

let requestedUrl;
globalThis.fetch = async url => {
  requestedUrl = url;
  return { ok: true, json: async () => ({ items }) };
};
await getHebcalData(2026);
assert.equal(requestedUrl.searchParams.get('geonameid'), '293397');
assert.equal(requestedUrl.searchParams.get('M'), 'on');
assert.equal(requestedUrl.searchParams.get('year'), '2026');
console.log('Homepage Shabbat: Israel weekday boundaries, event pairing, dates and shared source passed.');
