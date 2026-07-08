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

function isMissingCustomUrlColumn(error) {
  const message = String(error?.message || '');
  return (
    error?.code === 'ER_BAD_FIELD_ERROR' ||
    error?.code === '42703' ||
    message.includes('custom_url') ||
    message.includes('Unknown column')
  );
}

async function queryCategoryLinks(pool, query, fallbackQuery, params = []) {
  try {
    return await queryRows(pool, query, params);
  } catch (error) {
    if (!isMissingCustomUrlColumn(error)) throw error;
    return queryRows(pool, fallbackQuery, params);
  }
}

export async function GET() {
  try {
    const pool = await getPool();
    const activeValue = isPostgres() ? 'TRUE' : '1';
    const menuValue = isPostgres() ? 'TRUE' : '1';

    const parentCategories = await queryCategoryLinks(
      pool,
      `
        SELECT id, name, slug, description, custom_url
        FROM categories
        WHERE parent_id IS NULL
          AND is_active = ${activeValue}
          AND is_menu = ${menuValue}
        ORDER BY sort_order ASC, name ASC
      `,
      `
        SELECT id, name, slug, description, NULL AS custom_url
        FROM categories
        WHERE parent_id IS NULL
          AND is_active = ${activeValue}
          AND is_menu = ${menuValue}
        ORDER BY sort_order ASC, name ASC
      `
    );

    const categoriesWithSubs = await Promise.all(
      parentCategories.map(async (parent) => {
        const subs = await queryCategoryLinks(
          pool,
          `
            SELECT id, name, slug, description, custom_url
            FROM categories
            WHERE parent_id = ?
              AND is_active = ${activeValue}
              AND is_menu = ${menuValue}
            ORDER BY sort_order ASC, name ASC
          `,
          `
            SELECT id, name, slug, description, NULL AS custom_url
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
