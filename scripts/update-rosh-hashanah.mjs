import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { getPool } from '../src/lib/db.js';
import { articles, guideUrl } from './rosh-hashanah-content.mjs';

// Existing URLs are retained so menus, embeds and saved article links keep working.
const apply = process.argv.includes('--apply');
const pdf = await readFile(join(process.cwd(), 'public', guideUrl));
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
for (const article of articles) {
  assert.ok(article.content.includes(guideUrl));
  assert.ok(!/<a\b[^>]*href\s*=\s*["'](?:https?:)?\/\//i.test(article.content));
}
const pool = await getPool();
if (!['postgres', 'pg'].includes(process.env.DB_TYPE)) {
  await pool.end();
  throw new Error('This migration requires the configured PostgreSQL database.');
}
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows: categories } = await client.query("SELECT * FROM categories WHERE slug='tishrei-holidays' FOR UPDATE");
  assert.equal(categories.length, 1);
  const category = categories[0];
  assert.equal(category.id, 45);
  assert.ok(['חגי תשרי', 'ראש השנה'].includes(category.name));
  const { rows: previous } = await client.query('SELECT * FROM articles WHERE category_id=$1 ORDER BY id FOR UPDATE', [category.id]);
  assert.deepEqual(previous.map(a => a.id), articles.map(a => a.id));
  const { rows: templates } = await client.query(
    "SELECT * FROM hp_templates WHERE template_html LIKE $1 OR homepage_html LIKE $1 FOR UPDATE", ['%חגי תשרי%']);
  const description = 'ראש השנה למעשה: הכנת השולחן והסימנים, סדר התפילות, שופר והלכות שני ימי החג, לצד משמעות רוחנית והחלטות טובות.';
  if (!apply) {
    console.log(JSON.stringify({ category: { id: category.id, from: category.name, to: 'ראש השנה' }, articles: articles.map(a => ({ id: a.id, title: a.title, characters: a.content.length })), templateIds: templates.map(t => t.id) }, null, 2));
    await client.query('ROLLBACK');
  } else {
    const directory = join(tmpdir(), 'chabad-content-backups');
    await mkdir(directory, { recursive: true });
    const backup = join(directory, `rosh-hashanah-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify({ categories, articles: previous, templates }, null, 2), { flag: 'wx' });
    await client.query('UPDATE categories SET name=$1, description=$2 WHERE id=$3', ['ראש השנה', description, category.id]);
    for (const article of articles) {
      const result = await client.query(
        'UPDATE articles SET title=$1, excerpt=$2, short_description=$2, content=$3, is_free_html=FALSE WHERE id=$4 AND category_id=$5',
        [article.title, article.description, article.content, article.id, category.id]);
      assert.equal(result.rowCount, 1);
    }
    for (const template of templates) {
      await client.query('UPDATE hp_templates SET template_html=$1, homepage_html=$2 WHERE id=$3', [
        template.template_html?.replaceAll('חגי תשרי', 'ראש השנה') ?? null,
        template.homepage_html?.replaceAll('חגי תשרי', 'ראש השנה') ?? null,
        template.id,
      ]);
    }
    const { rows: saved } = await client.query('SELECT * FROM articles WHERE category_id=$1 ORDER BY id', [category.id]);
    for (const [index, article] of articles.entries()) {
      assert.equal(saved[index].title, article.title);
      assert.equal(saved[index].content, article.content);
      assert.equal(saved[index].short_description, article.description);
      assert.equal(saved[index].slug, previous[index].slug);
      assert.equal(saved[index].status, previous[index].status);
      assert.equal(saved[index].is_free_html, false);
    }
    const { rows: renamed } = await client.query('SELECT name FROM categories WHERE id=$1', [category.id]);
    assert.equal(renamed[0].name, 'ראש השנה');
    await client.query('COMMIT');
    console.log(JSON.stringify({ updatedArticles: saved.map(a => ({ id: a.id, title: a.title })), updatedTemplates: templates.map(t => t.id), backup, verified: true }, null, 2));
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
