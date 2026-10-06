import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';

const pool = await getPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  if (process.argv.includes('--apply')) {
    await client.query('LOCK TABLE articles IN SHARE ROW EXCLUSIVE MODE');
    const { rows: [source] } = await client.query('SELECT * FROM articles WHERE id=503 AND category_id=64');
    assert.equal(source?.slug, 'tefillin-mezuzah-10');
    const { rows: [category] } = await client.query('SELECT * FROM categories WHERE id=8');
    assert.equal(category?.name, 'שירותים לציבור');
    const slug = 'tefillin-mezuzot-services';
    const { rows: existing } = await client.query('SELECT * FROM articles WHERE slug=$1', [slug]);
    if (existing.length) {
      assert.equal(existing[0].category_id, 8);
      assert.equal(existing[0].content, source.content);
      console.log(JSON.stringify({ alreadyCopied: true, id: existing[0].id, slug }));
    } else {
      const { rows: images } = await client.query('SELECT * FROM article_images WHERE article_id=$1 ORDER BY id', [source.id]);
      await mkdir('tmp/content-backups', { recursive: true });
      const backup = `tmp/content-backups/before-tefillin-mezuzot-${Date.now()}.json`;
      await writeFile(backup, JSON.stringify({ source, images }, null, 2));
      const copy = { ...source, title: 'תפילין ומזוזות', slug, category_id: 8, sort_order: 1, is_main_article: false };
      for (const key of ['id', 'created_at', 'updated_at']) delete copy[key];
      const keys = Object.keys(copy);
      assert.ok(keys.every(key => /^[a-z_]+$/.test(key)));
      const { rows: [saved] } = await client.query(`INSERT INTO articles (${keys.join(',')}) VALUES (${keys.map((_,i) => `$${i+1}`).join(',')}) RETURNING *`, keys.map(key => copy[key]));
      for (const image of images) {
        const { rows: [cloned] } = await client.query('INSERT INTO article_images (article_id,image_url,alt_text,display_order,asset_id) VALUES ($1,$2,$3,$4,$5) RETURNING id', [saved.id,image.image_url,image.alt_text,image.display_order,image.asset_id]);
        if (String(source.short_description_image) === String(image.id)) await client.query('UPDATE articles SET short_description_image=$1 WHERE id=$2', [String(cloned.id),saved.id]);
      }
      assert.equal(saved.content, source.content);
      console.log(JSON.stringify({ copied: true, id: saved.id, slug, backup, images: images.length }));
    }
    await client.query('COMMIT');
  } else {
  const { rows: categories } = await client.query('SELECT id,name,slug FROM categories ORDER BY id');
  const { rows: articles } = await client.query(`SELECT id,title,slug,category_id,status,sort_order FROM articles WHERE title LIKE '%מזוז%' OR title LIKE '%תפיל%' ORDER BY id`);
  const { rows: source } = await client.query('SELECT * FROM articles WHERE category_id=64 ORDER BY is_main_article DESC, sort_order,id');
  const { rows: columns } = await client.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('article_blocks','article_images') ORDER BY table_name,ordinal_position");
  console.log(JSON.stringify({ categories: categories.filter(c => [8,58,64].includes(c.id)), articles: articles.filter(a => [8,64].includes(a.category_id)), source: source.map(a => ({...a,content:a.content?.slice(0,900)})), columns }, null, 2));
    await client.query('ROLLBACK');
  }
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { client.release(); await pool.end(); }
