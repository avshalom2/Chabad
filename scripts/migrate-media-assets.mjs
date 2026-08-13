import { readFile } from 'fs/promises';
import { getPool } from '../src/lib/db.js';
import { listCloudinaryAssets } from '../src/lib/cloudinary.js';
import { refreshMediaReferences, syncMediaAssets } from '../src/lib/media-assets.js';

const pool = await getPool();
try {
  const sql = await readFile(new URL('../migrations/add-media-assets.sql', import.meta.url), 'utf8');
  await pool.query(sql);

  let cursor;
  let imported = 0;
  do {
    const page = await listCloudinaryAssets({ nextCursor: cursor, maxResults: 100 });
    await syncMediaAssets(page.assets);
    imported += page.assets.length;
    cursor = page.nextCursor || undefined;
  } while (cursor);

  await refreshMediaReferences();
  const summary = await pool.query(`SELECT
    (SELECT COUNT(*)::int FROM media_assets) AS assets,
    (SELECT COUNT(*)::int FROM media_references) AS references,
    (SELECT COUNT(*)::int FROM media_assets a WHERE NOT EXISTS
      (SELECT 1 FROM media_references r WHERE r.asset_id=a.id)) AS unused`);
  console.log(JSON.stringify({ imported, ...summary.rows[0] }));
} finally {
  await pool.end();
}
