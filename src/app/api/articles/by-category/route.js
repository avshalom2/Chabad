import { getPool } from '@/lib/db.js';

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

function shortDescriptionImageJoin() {
  if (isPostgres()) {
    return `LEFT JOIN article_images ai ON a.short_description_image ~ '^[0-9]+$' AND ai.id = a.short_description_image::integer`;
  }

  return 'LEFT JOIN article_images ai ON ai.id = a.short_description_image';
}

export async function GET(request) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!categoryId && !categorySlug) {
      return Response.json({ error: 'categoryId or categorySlug is required' }, { status: 400 });
    }

    let resolvedCategoryId = categoryId ? parseInt(categoryId) : null;

    if (!resolvedCategoryId && categorySlug) {
      const cats = await queryRows(
        pool,
        `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
        [categorySlug]
      );
      if (cats.length > 0) resolvedCategoryId = cats[0].id;
    }

    if (!resolvedCategoryId) {
      return Response.json([]);
    }

    const articles = await queryRows(
      pool,
      `SELECT a.id, a.title, a.slug, a.short_description, a.excerpt, a.featured_image,
              a.short_description_image AS short_description_image_id,
              ai.image_url AS short_description_image_url,
              a.price, a.is_purchasable, a.stock, a.template,
              a.published_at, a.status,
              c.name AS category_name, c.slug AS category_slug,
              u.display_name AS author_name
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       ${shortDescriptionImageJoin()}
       LEFT JOIN users u ON u.id = a.author_id
       WHERE a.status = 'published' AND a.category_id = ?
       ORDER BY a.is_main_article DESC, a.published_at DESC, a.created_at DESC
       LIMIT ?`,
      [resolvedCategoryId, limit]
    );

    return Response.json(articles);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return Response.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
