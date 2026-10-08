import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';
const pool = await getPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows: [article] } = await client.query('SELECT * FROM articles WHERE id=960 FOR UPDATE');
  assert.equal(article.slug, 'herzliya-pituach-mikvah-services');
  assert.equal(article.category_id, 8);
  const fields = ['excerpt', 'short_description', 'content', 'page_html'];
  const updates = { title: 'מקווה טהרה' };
  for (const field of fields) {
    if (typeof article[field] === 'string') {
      const value = article[field].replace(/הרצליה\s+פיתוח/g, 'הרצליה');
      if (value !== article[field]) updates[field] = value;
    }
  }
  await mkdir('tmp/content-backups', { recursive: true });
  const backup = `tmp/content-backups/mikveh-title-${Date.now()}.json`;
  await writeFile(backup, JSON.stringify(article, null, 2), { flag: 'wx' });
  const names = Object.keys(updates);
  const { rows: [saved] } = await client.query(`UPDATE articles SET ${names.map((name, index) => `${name}=$${index+1}`).join(',')}, updated_at=NOW() WHERE id=$${names.length+1} RETURNING *`, [...Object.values(updates), article.id]);
  for (const field of names) assert.equal(saved[field], updates[field]);
  assert.equal(saved.status, 'published');
  for (const field of fields) assert.ok(!/הרצליה\s+פיתוח/.test(saved[field] || ''));
  await client.query('COMMIT');
  console.log(JSON.stringify({ id: saved.id, title: saved.title, changedFields: names, backup, verified: true }));
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally { client.release(); await pool.end(); }
