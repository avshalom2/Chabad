import { getPool } from './db.js';

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

function adaptPlaceholders(query, params) {
  if (!isPostgres()) {
    return [query, params];
  }

  let idx = 0;
  return [query.replace(/\?/g, () => `$${++idx}`), params];
}

async function queryRows(pool, query, params = []) {
  const [adaptedQuery, adaptedParams] = adaptPlaceholders(query, params);
  const result = await pool.query(adaptedQuery, adaptedParams);
  return isPostgres() ? result.rows : result[0];
}

async function queryFirst(pool, query, params = []) {
  const rows = await queryRows(pool, query, params);
  return rows[0] || null;
}

async function execute(pool, query, params = []) {
  const [adaptedQuery, adaptedParams] = adaptPlaceholders(query, params);
  return pool.query(adaptedQuery, adaptedParams);
}

function randomOrderSql() {
  return isPostgres() ? 'RANDOM()' : 'RAND()';
}

function mainArticleFlag(value) {
  return isPostgres() ? value : value ? 1 : 0;
}

function shortDescriptionImageJoin(alias = 'a') {
  if (isPostgres()) {
    return `LEFT JOIN article_images ai ON ${alias}.short_description_image ~ '^[0-9]+$' AND ai.id = ${alias}.short_description_image::integer`;
  }

  return `LEFT JOIN article_images ai ON ai.id = ${alias}.short_description_image`;
}

export async function getArticles({ status = 'published', categoryId = null, limit = 50, offset = 0 } = {}) {
  const pool = await getPool();
  let sql = `
    SELECT a.*, c.name AS category_name, c.slug AS category_slug,
           c.parent_id, p.name AS parent_category_name, p.slug AS parent_category_slug,
           u.display_name AS author_name
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    LEFT JOIN categories p ON p.id = c.parent_id
    LEFT JOIN users u ON u.id = a.author_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (categoryId) {
    sql += ' AND a.category_id = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY p.name, c.name, a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return queryRows(pool, sql, params);
}

export async function getArticleById(id) {
  const pool = await getPool();
  return queryFirst(
    pool,
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
            u.display_name AS author_name
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN users u ON u.id = a.author_id
     WHERE a.id = ?`,
    [id]
  );
}

export async function getArticleBySlug(slugOrId) {
  const pool = await getPool();
  const isNumeric = /^\d+$/.test(slugOrId);

  if (isNumeric) {
    return queryFirst(
      pool,
      `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
              u.display_name AS author_name
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       LEFT JOIN users u ON u.id = a.author_id
       WHERE a.id = ?`,
      [slugOrId]
    );
  }

  return queryFirst(
    pool,
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
            u.display_name AS author_name
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN users u ON u.id = a.author_id
     WHERE a.slug = ?`,
    [slugOrId]
  );
}

export async function createArticle({
  title,
  slug,
  excerpt = null,
  short_description = null,
  content = null,
  category_id,
  author_id = null,
  featured_image = null,
  price = null,
  is_purchasable = 0,
  stock = null,
  status = 'draft',
  template = 'standard',
  is_main_article = 0,
  article_type = 'article',
}) {
  const published_at = status === 'published' ? new Date() : null;
  const pool = await getPool();

  if (isPostgres()) {
    const result = await execute(
      pool,
      `INSERT INTO articles
        (title, slug, excerpt, short_description, content, category_id, author_id, featured_image, price, is_purchasable, stock, status, published_at, template, is_main_article, article_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [title, slug, excerpt, short_description, content, category_id, author_id, featured_image, price, is_purchasable, stock, status, published_at, template, is_main_article, article_type]
    );
    return result.rows[0]?.id || null;
  }

  const [result] = await execute(
    pool,
    `INSERT INTO articles (title, slug, excerpt, short_description, content, category_id, author_id, featured_image, price, is_purchasable, stock, status, published_at, template, is_main_article, article_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, excerpt, short_description, content, category_id, author_id, featured_image, price, is_purchasable, stock, status, published_at, template, is_main_article, article_type]
  );
  return result.insertId;
}

export async function updateArticle(id, fields) {
  const allowed = ['title', 'slug', 'excerpt', 'short_description', 'short_description_image', 'content', 'category_id', 'featured_image', 'price', 'is_purchasable', 'stock', 'status', 'published_at', 'page_html', 'template', 'is_main_article', 'article_type'];
  const updates = Object.keys(fields).filter((key) => allowed.includes(key));

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  if (fields.status === 'published' && !fields.published_at) {
    updates.push('published_at');
    fields.published_at = new Date();
  }

  const sql = `UPDATE articles SET ${updates.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`;
  const values = [...updates.map((key) => fields[key]), id];
  const pool = await getPool();
  await execute(pool, sql, values);
}

export async function deleteArticle(id) {
  const pool = await getPool();
  await execute(pool, 'DELETE FROM articles WHERE id = ?', [id]);
}

export async function publishArticle(id) {
  const pool = await getPool();
  await execute(
    pool,
    `UPDATE articles SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE id = ?`,
    [id]
  );
}

export async function archiveArticle(id) {
  const pool = await getPool();
  await execute(pool, `UPDATE articles SET status = 'archived' WHERE id = ?`, [id]);
}

export async function getRelatedArticles(categoryId, excludeId, limit = 5) {
  const pool = await getPool();
  return queryRows(
    pool,
    `SELECT a.id, a.title, a.slug, a.short_description, a.published_at,
            ai.image_url AS short_description_image_url,
            u.display_name AS author_name
     FROM articles a
     ${shortDescriptionImageJoin('a')}
     LEFT JOIN users u ON u.id = a.author_id
     WHERE a.category_id = ? AND a.status = 'published' AND a.id != ?
     ORDER BY ${randomOrderSql()}
     LIMIT ?`,
    [categoryId, excludeId, limit]
  );
}

export async function getArticlesByCategorySlug(slug, { limit = 20, offset = 0 } = {}) {
  const pool = await getPool();
  const category = await queryFirst(
    pool,
    `SELECT c.id, c.name, c.slug, c.parent_id, c.description, c.default_columns,
            ct.slug AS type_slug, ct.name AS type_name
     FROM categories c
     JOIN category_types ct ON ct.id = c.category_type_id
     WHERE c.slug = ? AND c.is_active = ${isPostgres() ? 'TRUE' : '1'}`,
    [slug]
  );

  if (!category) {
    return { category: null, mainArticle: null, articles: [], total: 0 };
  }

  let categoryIds = [Number(category.id)];

  if (!category.parent_id) {
    const subs = await queryRows(
      pool,
      `SELECT id FROM categories WHERE parent_id = ? AND is_active = ${isPostgres() ? 'TRUE' : '1'}`,
      [category.id]
    );
    categoryIds = [Number(category.id), ...subs.map((sub) => Number(sub.id))];
  }

  let parentCategory = null;
  if (category.parent_id) {
    parentCategory = await queryFirst(
      pool,
      `SELECT id, name, slug FROM categories WHERE id = ?`,
      [category.parent_id]
    );
  }

  const inPlaceholders = categoryIds.map(() => '?').join(', ');

  const mainArticle = await queryFirst(
    pool,
    `SELECT a.id, a.title, a.slug, a.short_description, a.excerpt, a.featured_image,
            a.short_description_image AS short_description_image_id,
            ai.image_url AS short_description_image_url,
            a.price, a.is_purchasable, a.stock, a.template,
            a.published_at, a.status,
            c.name AS category_name, c.slug AS category_slug
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     ${shortDescriptionImageJoin('a')}
     WHERE a.status = 'published' AND a.is_main_article = ? AND a.category_id IN (${inPlaceholders})
     LIMIT 1`,
    [mainArticleFlag(true), ...categoryIds]
  );

  const articles = await queryRows(
    pool,
    `SELECT a.id, a.title, a.slug, a.short_description, a.excerpt, a.featured_image,
            a.short_description_image AS short_description_image_id,
            ai.image_url AS short_description_image_url,
            a.price, a.is_purchasable, a.stock, a.template,
            a.published_at, a.status,
            c.name AS category_name, c.slug AS category_slug
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     ${shortDescriptionImageJoin('a')}
     WHERE a.status = 'published' AND a.is_main_article = ? AND a.category_id IN (${inPlaceholders})
     ORDER BY a.published_at DESC, a.created_at DESC
     LIMIT ? OFFSET ?`,
    [mainArticleFlag(false), ...categoryIds, limit, offset]
  );

  const totalRow = await queryFirst(
    pool,
    `SELECT COUNT(*) AS total
     FROM articles
     WHERE status = 'published' AND is_main_article = ? AND category_id IN (${inPlaceholders})`,
    [mainArticleFlag(false), ...categoryIds]
  );

  return {
    category: { ...category, parentCategory },
    mainArticle,
    articles,
    total: Number(totalRow?.total || 0),
  };
}

export async function getParentCategoryOverview(parentSlug) {
  const pool = await getPool();
  const parent = await queryFirst(
    pool,
    `SELECT c.*, ct.slug AS type_slug, ct.name AS type_name
     FROM categories c
     JOIN category_types ct ON ct.id = c.category_type_id
     WHERE c.slug = ? AND c.is_active = ${isPostgres() ? 'TRUE' : '1'}`,
    [parentSlug]
  );

  if (!parent || parent.parent_id) {
    return null;
  }

  const subcats = await queryRows(
    pool,
    `SELECT id, name, slug, description, image_url, default_columns
     FROM categories
     WHERE parent_id = ? AND is_active = ${isPostgres() ? 'TRUE' : '1'}
     ORDER BY sort_order ASC, name ASC`,
    [parent.id]
  );

  const subcategoriesWithArticles = await Promise.all(
    subcats.map(async (sub) => {
      const firstArticle = await queryFirst(
        pool,
        `SELECT a.id, a.title, a.slug, a.short_description, a.excerpt,
                a.short_description_image AS short_description_image_id,
                ai.image_url AS short_description_image_url
         FROM articles a
         ${shortDescriptionImageJoin('a')}
         WHERE a.status = 'published' AND a.category_id = ?
         ORDER BY a.published_at DESC, a.created_at DESC
         LIMIT 1`,
        [sub.id]
      );

      return { ...sub, firstArticle };
    })
  );

  return { category: parent, subcategories: subcategoriesWithArticles };
}

export async function getArticleImages(articleId) {
  const pool = await getPool();
  return queryRows(
    pool,
    `SELECT id, article_id, image_url, alt_text, display_order, created_at
     FROM article_images
     WHERE article_id = ?
     ORDER BY display_order ASC`,
    [articleId]
  );
}

export async function addArticleImage(articleId, imageUrl, altText = null) {
  const pool = await getPool();
  const maxOrderRow = await queryFirst(
    pool,
    `SELECT COALESCE(MAX(display_order), -1) AS maxorder FROM article_images WHERE article_id = ?`,
    [articleId]
  );
  const nextOrder = Number(maxOrderRow?.maxorder ?? -1) + 1;

  if (isPostgres()) {
    const result = await execute(
      pool,
      `INSERT INTO article_images (article_id, image_url, alt_text, display_order)
       VALUES (?, ?, ?, ?)
       RETURNING id, created_at`,
      [articleId, imageUrl, altText, nextOrder]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      article_id: articleId,
      image_url: imageUrl,
      alt_text: altText,
      display_order: nextOrder,
      created_at: row.created_at,
    };
  }

  const [result] = await execute(
    pool,
    `INSERT INTO article_images (article_id, image_url, alt_text, display_order)
     VALUES (?, ?, ?, ?)`,
    [articleId, imageUrl, altText, nextOrder]
  );
  return {
    id: result.insertId,
    article_id: articleId,
    image_url: imageUrl,
    alt_text: altText,
    display_order: nextOrder,
    created_at: new Date(),
  };
}

export async function deleteArticleImage(imageId) {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await execute(pool, `DELETE FROM article_images WHERE id = ?`, [imageId]);
    return result.rowCount > 0;
  }

  const [result] = await execute(pool, `DELETE FROM article_images WHERE id = ?`, [imageId]);
  return result.affectedRows > 0;
}

export async function updateArticleImage(imageId, altText) {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await execute(pool, `UPDATE article_images SET alt_text = ? WHERE id = ?`, [altText, imageId]);
    return result.rowCount > 0;
  }

  const [result] = await execute(pool, `UPDATE article_images SET alt_text = ? WHERE id = ?`, [altText, imageId]);
  return result.affectedRows > 0;
}

export async function reorderArticleImages(articles) {
  const pool = await getPool();
  for (const img of articles) {
    await execute(
      pool,
      `UPDATE article_images SET display_order = ? WHERE id = ?`,
      [img.display_order, img.id]
    );
  }
  return true;
}

export async function getGalleries({ status = 'published', categoryId = null, limit = 20, offset = 0 } = {}) {
  const pool = await getPool();
  let sql = `
    SELECT a.id, a.title, a.slug, a.article_type, a.featured_image,
           a.published_at, a.created_at,
           c.name AS category_name, c.slug AS category_slug,
           u.display_name AS author_name
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    LEFT JOIN users u ON u.id = a.author_id
    WHERE a.article_type = 'gallery'
  `;
  const params = [];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (categoryId) {
    sql += ' AND a.category_id = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = await queryRows(pool, sql, params);
  return Promise.all(
    rows.map(async (gallery) => ({
      ...gallery,
      images: await getArticleImages(gallery.id),
    }))
  );
}

export async function getGalleryBySlug(slug) {
  const pool = await getPool();
  const gallery = await queryFirst(
    pool,
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
            u.display_name AS author_name
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN users u ON u.id = a.author_id
     WHERE a.slug = ? AND a.article_type = 'gallery' AND a.status = 'published'`,
    [slug]
  );

  if (!gallery) {
    return null;
  }

  gallery.images = await getArticleImages(gallery.id);
  return gallery;
}

export async function getRecentGalleries(limit = 6) {
  return getGalleries({ status: 'published', limit });
}
