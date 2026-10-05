import { unstable_cache, revalidateTag } from 'next/cache.js';
import { getSetting } from './settings.js';

const TAG = 'store-hours';
export const getCachedStoreHours = unstable_cache(
  async () => (await getSetting('store_hours')) || {},
  ['store-hours-display-v1'],
  { tags: [TAG], revalidate: 3600 }
);

export function invalidateStoreHours() {
  revalidateTag(TAG, { expire: 0 });
}

export async function getInitialStoreHours() {
  try {
    return await getCachedStoreHours();
  } catch (error) {
    console.error('Could not preload store hours:', error.message);
    return undefined;
  }
}
