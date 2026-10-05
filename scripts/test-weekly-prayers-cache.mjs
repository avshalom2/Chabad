import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { getPrayerWeekKey } from '../src/lib/weekly-prayers-cache-key.js';

const entries = new Map();
let reads = 0;
let complete = true;
let invalidation;
let cacheOptions;
let revision = 1;
mock.module('next/cache.js', { namedExports: {
  unstable_cache(fn, keys, options) {
    cacheOptions = options;
    return async (...args) => {
      const key = JSON.stringify([keys, args]);
      if (!entries.has(key)) entries.set(key, await fn(...args));
      return entries.get(key);
    };
  },
  revalidateTag(tag, options) { invalidation = { tag, options }; entries.clear(); },
} });
mock.module('../src/lib/weekly-prayers.js', { namedExports: {
  async getWeeklyPrayerSchedule() {
    reads++;
    return complete ? { revision, dynamic_times: { maariv: '18:53' }, zmanim_data: { shabbat: { parasha_name: 'Test' } } } : { times: [] };
  },
} });
const { getCachedWeeklyPrayerSchedule, invalidateWeeklyPrayerSchedule } = await import('../src/lib/weekly-prayers-cache.js');

test('Israeli Sunday boundary, independent of UTC date and daylight saving', () => {
  assert.equal(getPrayerWeekKey(new Date('2026-10-10T20:59:59Z')), '2026-10-04');
  assert.equal(getPrayerWeekKey(new Date('2026-10-10T21:00:00Z')), '2026-10-11');
  assert.equal(getPrayerWeekKey(new Date('2026-10-24T20:59:59Z')), '2026-10-18');
  assert.equal(getPrayerWeekKey(new Date('2026-10-24T21:00:00Z')), '2026-10-25');
  assert.equal(getPrayerWeekKey(new Date('2026-10-31T21:59:59Z')), '2026-10-25');
  assert.equal(getPrayerWeekKey(new Date('2026-10-31T22:00:00Z')), '2026-11-01');
});

test('Repeated reads reuse prepared schedule; admin invalidation expires it immediately', async () => {
  const first = await getCachedWeeklyPrayerSchedule();
  assert.deepEqual(await getCachedWeeklyPrayerSchedule(), first);
  assert.equal(reads, 1);
  revision = 2;
  invalidateWeeklyPrayerSchedule();
  assert.deepEqual(invalidation, { tag: 'weekly-prayer-schedule', options: { expire: 0 } });
  assert.equal((await getCachedWeeklyPrayerSchedule()).revision, 2);
  assert.equal(reads, 2);
  assert.equal(cacheOptions.revalidate, 604800);
});

test('Incomplete data after an upstream failure is retried instead of cached for a week', async () => {
  invalidateWeeklyPrayerSchedule();
  complete = false;
  assert.deepEqual(await getCachedWeeklyPrayerSchedule(), { times: [] });
  complete = true;
  assert.equal((await getCachedWeeklyPrayerSchedule()).revision, 2);
  assert.equal(reads, 4);
});

test('A new Israeli week selects a fresh cache entry without waiting for TTL', async () => {
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-10T20:59:59Z') });
  invalidateWeeklyPrayerSchedule();
  const before = reads;
  await getCachedWeeklyPrayerSchedule();
  await getCachedWeeklyPrayerSchedule();
  assert.equal(reads, before + 1);
  mock.timers.setTime(new Date('2026-10-10T21:00:00Z').getTime());
  await getCachedWeeklyPrayerSchedule();
  assert.equal(reads, before + 2);
  mock.timers.reset();
});
