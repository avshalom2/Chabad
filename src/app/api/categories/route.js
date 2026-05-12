import { getCategories } from '@/lib/categories.js';
import { getPool } from '@/lib/db.js';

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

async function queryRows(pool, sql, params = []) {
  const result = await pool.query(sql, params);
  return isPostgres() ? result.rows : result[0];
}

export async function GET(request) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const typeSlug = searchParams.get('type') || null;

    let categories;

    if (typeSlug === 'news') {
      // Filter directly by category_type_id = 4
      const activeCondition = isPostgres() ? 'TRUE' : '1';
      const rows = await queryRows(
        pool,
        `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
         FROM categories c
         JOIN category_types ct ON ct.id = c.category_type_id
         WHERE c.category_type_id = 4 AND c.is_active = ${activeCondition}
         ORDER BY c.sort_order ASC, c.name ASC`
      );
      categories = rows;
    } else if (typeSlug === 'articles-slider' || typeSlug === 'articles-cube') {
      // Filter for specialized article display categories
      const activeCondition = isPostgres() ? 'TRUE' : '1';
      const typePlaceholder = isPostgres() ? '$1' : '?';
      const rows = await queryRows(
        pool,
        `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug, pc.name AS parent_name
         FROM categories c
         JOIN category_types ct ON ct.id = c.category_type_id
         LEFT JOIN categories pc ON pc.id = c.parent_id
         WHERE ct.slug = ${typePlaceholder} AND c.is_active = ${activeCondition}
         ORDER BY c.sort_order ASC, c.name ASC`,
        [typeSlug]
      );
      categories = rows;
    } else {
      categories = await getCategories({ typeSlug, activeOnly: true });
    }

    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
