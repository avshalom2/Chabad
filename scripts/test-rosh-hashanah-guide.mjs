import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRoshHashanahGuide } from '../src/lib/rosh-hashanah-guide.js';
import { GET } from '../src/app/api/holidays/rosh-hashanah/guide/route.js';
import config from '../next.config.mjs';

const cases = [
  [2024, 5785, 4, 'thursday_friday'],
  [2025, 5786, 2, 'weekdays_final'],
  [2026, 5787, 6, 'suterday_sunday'],
  [2029, 5790, 1, 'weekdays_final'],
];
for (const [year, hebrewYear, firstDay, variant] of cases) {
  // The selection stays on the current calendar year's holiday even after it ends.
  for (const month of ['01', '08', '12']) {
    const guide = getRoshHashanahGuide(new Date(`${year}-${month}-15T12:00:00Z`));
    assert.deepEqual(guide, {
      year, hebrewYear, firstDay, filename: `rosh_hashanah_guide_${variant}.pdf`,
    });
    const pdf = await readFile(new URL(`../public/uploads/holidays/${guide.filename}`, import.meta.url));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  }
}
assert.equal(getRoshHashanahGuide(new Date('2025-12-31T21:59:59Z')).year, 2025);
assert.equal(getRoshHashanahGuide(new Date('2025-12-31T22:00:00Z')).year, 2026);
const response = GET(new Request('https://example.com/api/holidays/rosh-hashanah/guide'));
const { filename } = getRoshHashanahGuide();
assert.equal(response.status, 307);
assert.equal(response.headers.get('Cache-Control'), 'no-store');
assert.equal(response.headers.get('Location'), `https://example.com/uploads/holidays/${filename}`);
assert.deepEqual((await config.rewrites()).beforeFiles, [{
  source: '/uploads/holidays/rosh-hashanah-step-by-step.pdf',
  destination: '/api/holidays/rosh-hashanah/guide',
}]);
console.log('Passed: all four weekdays, year boundaries, available PDFs, and download route.');
