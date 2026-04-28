import { getPool } from './db.js';

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

function activeFlag(value) {
  return isPostgres() ? value : value ? 1 : 0;
}

export async function getCategories({ typeSlug = null, activeOnly = true } = {}) {
  const pool = await getPool();
  let sql = `
    SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
    FROM categories c
    JOIN category_types ct ON ct.id = c.category_type_id
    WHERE 1=1
  `;
  const params = [];

  if (typeSlug) {
    sql += isPostgres() ? ` AND ct.slug = $${params.length + 1}` : ' AND ct.slug = ?';
    params.push(typeSlug);
  }

  if (activeOnly) {
    sql += isPostgres() ? ' AND c.is_active = TRUE' : ' AND c.is_active = 1';
  }

  sql += ' ORDER BY c.sort_order ASC, c.name ASC';

  if (isPostgres()) {
    const result = await pool.query(sql, params);
    return result.rows;
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getCategoryById(id) {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await pool.query(
      `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
       FROM categories c
       JOIN category_types ct ON ct.id = c.category_type_id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  const [rows] = await pool.query(
    `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
     FROM categories c
     JOIN category_types ct ON ct.id = c.category_type_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getCategoryBySlug(slug) {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await pool.query(
      `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
       FROM categories c
       JOIN category_types ct ON ct.id = c.category_type_id
       WHERE c.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  const [rows] = await pool.query(
    `SELECT c.*, ct.name AS type_name, ct.slug AS type_slug
     FROM categories c
     JOIN category_types ct ON ct.id = c.category_type_id
     WHERE c.slug = ?`,
    [slug]
  );
  return rows[0] || null;
}

export async function getSiblingCategories(parentId) {
  if (!parentId) return [];

  const pool = await getPool();

  if (isPostgres()) {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.sort_order
       FROM categories c
       WHERE c.parent_id = $1 AND c.is_active = TRUE
       ORDER BY c.sort_order ASC, c.name ASC`,
      [parentId]
    );
    return result.rows;
  }

  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.description, c.sort_order
     FROM categories c
     WHERE c.parent_id = ? AND c.is_active = 1
     ORDER BY c.sort_order ASC, c.name ASC`,
    [parentId]
  );
  return rows;
}

export async function createCategory({
  name,
  slug,
  description,
  category_type_id,
  parent_id = null,
  image_url = null,
  is_menu = 0,
  sort_order = 0,
  default_columns = 3,
  created_by = null,
}) {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await pool.query(
      `INSERT INTO categories
        (name, slug, description, category_type_id, parent_id, image_url, is_menu, sort_order, default_columns, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        name,
        slug,
        description,
        category_type_id,
        parent_id,
        image_url,
        activeFlag(is_menu),
        sort_order,
        default_columns,
        created_by,
      ]
    );
    return result.rows[0]?.id || null;
  }

  const [result] = await pool.query(
    `INSERT INTO categories (name, slug, description, category_type_id, parent_id, image_url, is_menu, sort_order, default_columns, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, description, category_type_id, parent_id, image_url, is_menu, sort_order, default_columns, created_by]
  );
  return result.insertId;
}

export async function updateCategory(id, fields) {
  const pool = await getPool();
  const allowed = ['name', 'slug', 'description', 'image_url', 'sort_order', 'is_active', 'is_menu', 'parent_id', 'category_type_id', 'default_columns'];
  const updates = Object.keys(fields).filter((key) => allowed.includes(key));

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  if (isPostgres()) {
    const values = updates.map((key) => {
      if (key === 'is_active' || key === 'is_menu') {
        return activeFlag(fields[key]);
      }

      return fields[key];
    });

    const sql = `UPDATE categories SET ${updates
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')} WHERE id = $${updates.length + 1}`;

    await pool.query(sql, [...values, id]);
    return;
  }

  const sql = `UPDATE categories SET ${updates.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`;
  const values = [...updates.map((key) => fields[key]), id];
  await pool.query(sql, values);
}

export async function deleteCategory(id) {
  const pool = await getPool();

  if (isPostgres()) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return;
  }

  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

export async function getCategoryTypes() {
  const pool = await getPool();

  if (isPostgres()) {
    const result = await pool.query('SELECT * FROM category_types ORDER BY name ASC');
    return result.rows;
  }

  const [rows] = await pool.query('SELECT * FROM category_types ORDER BY name ASC');
  return rows;
}
