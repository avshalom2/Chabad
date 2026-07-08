import { deleteCategory, getCategoryById, updateCategory } from '@/lib/categories.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';
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

async function queryFirst(pool, query, params = []) {
  const [adaptedQuery, adaptedParams] = adaptPlaceholders(query, params);
  const result = await pool.query(adaptedQuery, adaptedParams);
  const rows = isPostgres() ? result.rows : result[0];
  return rows[0] || null;
}

function categoryErrorResponse(error, fallbackMessage) {
  if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
    return Response.json({ error: 'A category with that slug already exists' }, { status: 409 });
  }

  if (error.code === '23503' || error.code === 'ER_NO_REFERENCED_ROW_2') {
    return Response.json({ error: 'Selected category type, parent category, or user does not exist' }, { status: 400 });
  }

  return Response.json({ error: fallbackMessage }, { status: 500 });
}

function normalizeCustomUrl(value) {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return null;
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url;
  return `/${url}`;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const category = await getCategoryById(parseInt(id));

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    return Response.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return Response.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, category_type_id, parent_id, custom_url, is_menu, sort_order, is_active, default_columns } = body;
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanSlug = typeof slug === 'string' ? slug.trim() : '';

    if (!cleanName || !cleanSlug) {
      return Response.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Update the category
    await updateCategory(parseInt(id), {
      name: cleanName,
      slug: cleanSlug,
      description: description || null,
      category_type_id: category_type_id ? parseInt(category_type_id) : undefined,
      parent_id: parent_id ? parseInt(parent_id) : null,
      custom_url: normalizeCustomUrl(custom_url),
      is_menu: is_menu ? 1 : 0,
      sort_order: parseInt(sort_order) || 0,
      is_active: is_active ? 1 : 0,
      default_columns: default_columns ? parseInt(default_columns) : 3,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    return categoryErrorResponse(error, 'Failed to update category');
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, 'is_menu')) {
      updates.is_menu = body.is_menu ? 1 : 0;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'is_active')) {
      updates.is_active = body.is_active ? 1 : 0;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'sort_order')) {
      updates.sort_order = parseInt(body.sort_order) || 0;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await updateCategory(parseInt(id), updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Patch category error:', error);
    return Response.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id);
    const category = await getCategoryById(categoryId);

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    const pool = await getPool();
    const childCount = await queryFirst(
      pool,
      'SELECT COUNT(*) AS count FROM categories WHERE parent_id = ?',
      [categoryId]
    );
    const articleCount = await queryFirst(
      pool,
      'SELECT COUNT(*) AS count FROM articles WHERE category_id = ?',
      [categoryId]
    );
    const productCount = await queryFirst(
      pool,
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ?',
      [categoryId]
    ).catch(() => ({ count: 0 }));

    const children = Number(childCount?.count || 0);
    const articles = Number(articleCount?.count || 0);
    const products = Number(productCount?.count || 0);

    if (children > 0 || articles > 0 || products > 0) {
      return Response.json(
        {
          error: 'Cannot delete a category that contains subcategories, articles, or products. Move or delete its content first.',
          usage: { children, articles, products },
        },
        { status: 409 }
      );
    }

    await deleteCategory(categoryId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return categoryErrorResponse(error, 'Failed to delete category');
  }
}
