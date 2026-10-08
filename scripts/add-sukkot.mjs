import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPool } from '../src/lib/db.js';
import { getArticlesByCategorySlug } from '../src/lib/articles.js';
import { getSiblingCategories } from '../src/lib/categories.js';
import { sukkotArticle as article } from './sukkot-content.mjs';

const apply = process.argv.includes('--apply');
const pool = await getPool();
assert.ok(['postgres', 'pg'].includes(process.env.DB_TYPE));
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('LOCK TABLE categories, articles IN SHARE ROW EXCLUSIVE MODE');
  const { rows: [rosh] } = await client.query("SELECT * FROM categories WHERE slug='tishrei-holidays'");
  assert.equal(rosh?.name, 'ראש השנה');
  const { rows: [reference] } = await client.query('SELECT * FROM articles WHERE id=909 AND category_id=$1', [rosh.id]);
  assert.ok(reference?.is_main_article);
  const { rows: siblings } = await client.query('SELECT * FROM categories WHERE parent_id=$1 ORDER BY sort_order,id', [rosh.parent_id]);
  const { rows: existing } = await client.query("SELECT * FROM categories WHERE slug='sukkot'");
  const { rows: existingArticles } = await client.query('SELECT * FROM articles WHERE slug=$1', [article.slug]);
  if (existing.length || existingArticles.length) {
    assert.equal(existing.length, 1);
    assert.equal(existingArticles.length, 1);
    assert.equal(existingArticles[0].category_id, existing[0].id);
    assert.equal(existingArticles[0].content, article.content, 'Existing article differs; refusing to overwrite edits');
    await client.query('ROLLBACK');
    console.log('Sukkot already exists; no changes made.');
  } else if (!apply) {
    console.log(JSON.stringify({ parentId: rosh.parent_id, after: rosh.name,
      category: 'סוכות', categoryType: rosh.category_type_id, columns: rosh.default_columns,
      article: article.title, template: reference.template, mainArticle: true,
      status: reference.status, characters: article.content.length,
      shiftedCategories: siblings.filter(c => c.sort_order > rosh.sort_order).map(c => c.name),
    }, null, 2));
    await client.query('ROLLBACK');
  } else {
    const directory = join(tmpdir(), 'chabad-content-backups');
    await mkdir(directory, { recursive: true });
    const backup = join(directory, `before-sukkot-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify({ siblings, existing, existingArticles }, null, 2), { flag: 'wx' });
    await client.query('UPDATE categories SET sort_order=sort_order+1, updated_at=NOW() WHERE parent_id=$1 AND sort_order>$2', [rosh.parent_id, rosh.sort_order]);
    const { rows: [category] } = await client.query(`INSERT INTO categories
      (name,slug,description,category_type_id,parent_id,is_active,is_menu,sort_order,default_columns)
      VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7,$8) RETURNING *`,
    ['סוכות', 'sukkot', 'סוכות למעשה: ההכנות לחג, הסוכה וארבעת המינים, סדר הסעודות והתפילות, חול המועד ושמחת החג לפי מנהג חב״ד.',
      rosh.category_type_id, rosh.parent_id, rosh.is_menu, rosh.sort_order + 1, rosh.default_columns]);
    const { rows: [saved] } = await client.query(`INSERT INTO articles
      (title,slug,excerpt,short_description,content,category_id,article_type,status,template,is_main_article,published_at,is_free_html,sort_order)
      VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8,TRUE,NOW(),FALSE,1) RETURNING *`,
    [article.title, article.slug, article.description, article.content, category.id, reference.article_type, reference.status, reference.template]);
    assert.equal(saved.content, article.content);
    assert.equal(saved.is_main_article, true);
    const { rows: ordered } = await client.query('SELECT id FROM categories WHERE parent_id=$1 ORDER BY sort_order,name', [rosh.parent_id]);
    assert.equal(ordered[ordered.findIndex(c => c.id === rosh.id) + 1].id, category.id);
    await client.query('COMMIT');
    console.log(JSON.stringify({ categoryId: category.id, articleId: saved.id, backup, saved: true }, null, 2));
  }
  if (apply) {
    const result = await getArticlesByCategorySlug('sukkot');
    assert.equal(result.category.name, 'סוכות');
    assert.equal(result.mainArticle.slug, article.slug);
    // The site's paginated total excludes the separately fetched main article.
    assert.equal(Number(result.total) + (result.mainArticle ? 1 : 0), 1);
    const menu = await getSiblingCategories(rosh.parent_id);
    assert.equal(menu[menu.findIndex(c => c.id === rosh.id) + 1].slug, 'sukkot');
    console.log('Verified through site queries: category order, main article, and exactly one published article.');
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
