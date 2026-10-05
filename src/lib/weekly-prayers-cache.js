import { unstable_cache, revalidateTag } from 'next/cache.js';
import { getWeeklyPrayerSchedule } from './weekly-prayers.js';
import { getPrayerWeekKey } from './weekly-prayers-cache-key.js';

const TAG = 'weekly-prayer-schedule';
const readCachedSchedule = unstable_cache(
  async (weekKey) => {
    const schedule = await getWeeklyPrayerSchedule();
    // Do not persist an incomplete result after a temporary external API failure.
    if (!schedule?.dynamic_times || !schedule?.zmanim_data?.shabbat?.parasha_name) {
      throw Object.assign(new Error('Weekly prayer data is incomplete'), { uncachedSchedule: schedule });
    }
    return schedule;
  },
  ['weekly-prayer-display-v1'],
  { tags: [TAG], revalidate: 60 * 60 * 24 * 7 }
);

export async function getCachedWeeklyPrayerSchedule() {
  // Arguments form part of the cache key: Sunday starts a fresh entry immediately.
  try {
    return await readCachedSchedule(getPrayerWeekKey());
  } catch (error) {
    // Preserve the existing partial-data fallback, without caching it for a week.
    if (error.uncachedSchedule) return error.uncachedSchedule;
    throw error;
  }
}

export function invalidateWeeklyPrayerSchedule() {
  revalidateTag(TAG, { expire: 0 });
}

export async function getInitialWeeklyPrayerSchedule() {
  try {
    return await getCachedWeeklyPrayerSchedule();
  } catch (error) {
    console.error('Could not preload weekly prayer schedule:', error.message);
    // Keep the existing client fetch as a fallback when preloading fails.
    return undefined;
  }
}
