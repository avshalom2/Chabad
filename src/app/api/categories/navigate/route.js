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

export async function GET() {
  try {
    const pool = await getPool();
    const activeValue = isPostgres() ? 'TRUE' : '1';
    const menuValue = isPostgres() ? 'TRUE' : '1';

    const parentCategories = await queryRows(
      pool,
      `
        SELECT id, name, slug, description
        FROM categories
        WHERE parent_id IS NULL
          AND is_active = ${activeValue}
          AND is_menu = ${menuValue}
        ORDER BY sort_order ASC, name ASC
      `
    );

    const categoriesWithSubs = await Promise.all(
      parentCategories.map(async (parent) => {
        const subs = await queryRows(
          pool,
          `
            SELECT id, name, slug, description
            FROM categories
            WHERE parent_id = ?
              AND is_active = ${activeValue}
              AND is_menu = ${menuValue}
            ORDER BY sort_order ASC, name ASC
          `,
          [parent.id]
        );

        return {
          ...parent,
          subs,
        };
      })
    );

    return Response.json({ categories: categoriesWithSubs });
  } catch (error) {
    console.error('Failed to fetch navigation categories:', error);
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
