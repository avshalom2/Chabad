import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getPool } from '../src/lib/db.js';
import { getArticlesByCategorySlug, getArticleBySlug, getArticleImages } from '../src/lib/articles.js';
import { getSiblingCategories } from '../src/lib/categories.js';
import { sukkotArticles, sukkotImages, withArticleImage } from './sukkot-articles.mjs';

const apply = process.argv.includes('--apply');
const verifyOnly = process.argv.includes('--verify');
for (const image of sukkotImages) {
  const bytes = await readFile(join(process.cwd(), 'public', image.url));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
}
const pool = await getPool();
assert.ok(['postgres', 'pg'].includes(process.env.DB_TYPE));
const client = await pool.connect();
let committed = false;
try {
  if (!verifyOnly) {
    await client.query('BEGIN');
    await client.query('LOCK TABLE articles, article_images IN SHARE ROW EXCLUSIVE MODE');
    const { rows: [category] } = await client.query("SELECT * FROM categories WHERE slug='sukkot'");
    assert.ok(category);
    const { rows: reference } = await client.query(`SELECT a.* FROM articles a JOIN categories c ON c.id=a.category_id
      WHERE c.slug='tishrei-holidays' ORDER BY a.sort_order,a.id`);
    assert.equal(reference.length, 5);
    const { rows: before } = await client.query('SELECT * FROM articles WHERE category_id=$1 ORDER BY sort_order,id', [category.id]);
    const main = before.find(a => a.slug === 'sukkot-step-by-step');
    assert.equal(main?.is_main_article, true);
    const allowed = new Set(sukkotImages.map(i => i.slug));
    assert.ok(before.every(a => allowed.has(a.slug)), 'Unexpected article; review the category before migrating');
    const { rows: beforeImages } = await client.query('SELECT * FROM article_images WHERE article_id=ANY($1::int[])', [before.map(a => a.id)]);
    if (!apply) {
      console.log(JSON.stringify({ category: category.name, newArticles: sukkotArticles.map(a => a.title),
        images: sukkotImages.map(i => i.url), referenceArticles: reference.length }, null, 2));
      await client.query('ROLLBACK');
    } else {
      const directory = join(tmpdir(), 'chabad-content-backups');
      await mkdir(directory, { recursive: true });
      const backup = join(directory, `sukkot-expansion-${Date.now()}.json`);
      await writeFile(backup, JSON.stringify({ category, articles: before, images: beforeImages }, null, 2), { flag: 'wx' });
      for (const [index, image] of sukkotImages.entries()) {
        let saved = before.find(a => a.slug === image.slug);
        const draft = sukkotArticles.find(a => a.slug === image.slug);
        if (saved && draft) {
          assert.equal(saved.content, withArticleImage(draft.content, image), 'Existing article has edits; refusing to overwrite');
        }
        if (!saved) {
          assert.ok(draft);
          ({ rows: [saved] } = await client.query(`INSERT INTO articles
            (title,slug,excerpt,short_description,content,category_id,article_type,status,template,is_main_article,published_at,is_free_html,sort_order)
            VALUES ($1,$2,$3,$3,$4,$5,$6,'published',$7,FALSE,NOW(),FALSE,$8) RETURNING *`,
          [draft.title,draft.slug,draft.description,withArticleImage(draft.content,image),category.id,
            reference[index].article_type,reference[index].template,reference[index].sort_order]));
        }
        const { rows: matches } = await client.query('SELECT * FROM article_images WHERE article_id=$1 AND image_url=$2', [saved.id,image.url]);
        let linked = matches[0];
        if (!linked) {
          ({ rows: [linked] } = await client.query(`INSERT INTO article_images (article_id,image_url,alt_text,display_order)
            VALUES ($1,$2,$3,0) RETURNING *`, [saved.id,image.url,image.alt]));
        }
        await client.query(`UPDATE articles SET content=$1,short_description_image=$2,updated_at=NOW() WHERE id=$3`,
          [withArticleImage(saved.content,image),String(linked.id),saved.id]);
      }
      const { rows: saved } = await client.query('SELECT * FROM articles WHERE category_id=$1 ORDER BY sort_order,id', [category.id]);
      assert.equal(saved.length, 5);
      assert.deepEqual(saved.map(a => a.is_main_article), [true,false,false,false,false]);
      assert.deepEqual(saved.map(a => a.slug), sukkotImages.map(i => i.slug));
      for (const [index, row] of saved.entries()) {
        assert.equal(row.status,'published');
        assert.ok(row.content.includes(`src="${sukkotImages[index].url}"`));
        assert.ok(row.short_description_image);
      }
      await client.query('COMMIT');
      committed = true;
      console.log(JSON.stringify({ saved: saved.map(a => ({id:a.id,title:a.title})), backup }, null, 2));
    }
  }
  if (apply || verifyOnly) {
    const result = await getArticlesByCategorySlug('sukkot');
    assert.equal(result.mainArticle.slug, 'sukkot-step-by-step');
    assert.equal(result.total, 4);
    const displayed = [result.mainArticle, ...result.articles];
    assert.deepEqual(displayed.map(a => a.slug), sukkotImages.map(i => i.slug));
    for (const [index, row] of displayed.entries()) {
      const image = sukkotImages[index];
      assert.equal(row.short_description_image_url, image.url);
      const article = await getArticleBySlug(row.slug);
      assert.ok(article.content.includes(`src="${image.url}"`));
      assert.ok((await getArticleImages(article.id)).some(i => i.image_url === image.url && i.alt_text === image.alt));
    }
    const menu = await getSiblingCategories(result.category.parent_id);
    assert.equal(menu[menu.findIndex(c => c.slug === 'tishrei-holidays')+1].slug,'sukkot');
    console.log('Verified: five published articles in order, one main article, five card/inline images, and menu position.');
  }
} catch (error) {
  if (!committed && !verifyOnly) await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
