import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';

const pool = await getPool();
const client = await pool.connect();
const slug = 'herzliya-pituach-mikvah-services';
const quote = name => '"' + name.replaceAll('"', '""') + '"';
try {
  await client.query('BEGIN');
  await client.query('LOCK TABLE articles IN SHARE ROW EXCLUSIVE MODE');
  const { rows: [source] } = await client.query('SELECT * FROM articles WHERE id=951');
  const { rows: [disabled] } = await client.query('SELECT * FROM articles WHERE id=904');
  const { rows: [category] } = await client.query('SELECT * FROM categories WHERE id=8');
  assert.equal(source.slug, 'herzliya-pituach-mikvah-hours-location');
  assert.equal(disabled.title, 'תיקון ומכירת תפילין');
  assert.equal(category.name, 'שירותים לציבור');
  assert.equal((await client.query('SELECT id FROM articles WHERE slug=$1', [slug])).rowCount, 0, 'Copy already exists');
  const { rows: columns } = await client.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('articles','article_images','article_blocks') ORDER BY ordinal_position");
  const related = {};
  for (const table of ['article_images', 'article_blocks']) {
    if (columns.some(c => c.table_name === table)) related[table] = (await client.query(`SELECT * FROM ${quote(table)} WHERE article_id=$1 ORDER BY id`, [source.id])).rows;
  }
  await mkdir('tmp/content-backups', { recursive: true });
  const backup = `tmp/content-backups/mikveh-service-${Date.now()}.json`;
  await writeFile(backup, JSON.stringify({ source, disabled, related }, null, 2), { flag: 'wx' });
  async function insertCopy(table, row, overrides) {
    const names = columns.filter(c => c.table_name === table).map(c => c.column_name).filter(c => !['id','created_at','updated_at'].includes(c));
    const values = names.map(name => Object.hasOwn(overrides, name) ? overrides[name] : row[name]);
    const result = await client.query(`INSERT INTO ${quote(table)} (${names.map(quote).join(',')}) VALUES (${names.map((_, i) => '$' + (i+1)).join(',')}) RETURNING *`, values);
    return result.rows[0];
  }
  let copy = await insertCopy('articles', source, { slug, category_id: category.id, status: 'published' });
  let shortImage = source.short_description_image;
  for (const [table, rows] of Object.entries(related)) {
    for (const row of rows) {
      const saved = await insertCopy(table, row, { article_id: copy.id });
      if (table === 'article_images' && String(row.id) === String(shortImage)) {
        await client.query('UPDATE articles SET short_description_image=$1 WHERE id=$2', [String(saved.id), copy.id]);
      }
      for (const field of Object.keys(row).filter(k => !['id','article_id','created_at','updated_at'].includes(k))) assert.deepEqual(saved[field], row[field]);
    }
  }
  await client.query("UPDATE articles SET status='archived', updated_at=NOW() WHERE id=$1", [disabled.id]);
  copy = (await client.query('SELECT * FROM articles WHERE id=$1', [copy.id])).rows[0];
  for (const field of Object.keys(source).filter(k => !['id','slug','category_id','status','created_at','updated_at','short_description_image'].includes(k))) assert.deepEqual(copy[field], source[field], field);
  assert.equal(copy.status, 'published');
  assert.equal(copy.category_id, category.id);
  assert.equal((await client.query('SELECT status FROM articles WHERE id=904')).rows[0].status, 'archived');
  assert.deepEqual((await client.query('SELECT * FROM articles WHERE id=951')).rows[0], source);
  await client.query('COMMIT');
  console.log(JSON.stringify({ copiedId: copy.id, title: copy.title, slug, category: category.name, status: copy.status, archivedId: disabled.id, backup, verified: true }));
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
