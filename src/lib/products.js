import { getPool } from './db.js';

// ── GET ALL PRODUCTS ─────────────────────────────────────────
export async function getProducts({ status = 'published', categoryId = null, limit = 50, offset = 0 } = {}) {
  const pool = await getPool();
  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug,
           u.display_name AS created_by_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.created_by
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND p.status = ?';
    params.push(status);
  }
  if (categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ── GET SINGLE PRODUCT BY ID ─────────────────────────────────
export async function getProductById(id) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
            u.display_name AS created_by_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN users u ON u.id = p.created_by
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// ── GET SINGLE PRODUCT BY SLUG ───────────────────────────────
export async function getProductBySlug(slug) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ?`,
    [slug]
  );
  return rows[0] || null;
}

// ── CREATE PRODUCT ───────────────────────────────────────────
export async function createProduct({ title, slug, description = null, category_id, price = null, image_url = null, stock = null, status = 'draft', created_by = null }) {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO products (title, slug, description, category_id, price, image_url, stock, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, description, category_id, price, image_url, stock, status, created_by]
  );
  return result.insertId;
}

// ── UPDATE PRODUCT ───────────────────────────────────────────
export async function updateProduct(id, fields) {
  const allowed = ['title', 'slug', 'description', 'category_id', 'price', 'image_url', 'stock', 'status'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (updates.length === 0) throw new Error('No valid fields to update');

  const sql = `UPDATE products SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
  const values = [...updates.map(k => fields[k]), id];
  await pool.query(sql, values);
}

// ── DELETE PRODUCT ───────────────────────────────────────────
export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}

// ── PUBLISH PRODUCT ──────────────────────────────────────────
export async function publishProduct(id) {
  await pool.query(`UPDATE products SET status = 'published' WHERE id = ?`, [id]);
}

// ── ARCHIVE PRODUCT ──────────────────────────────────────────
export async function archiveProduct(id) {
  await pool.query(`UPDATE products SET status = 'archived' WHERE id = ?`, [id]);
}
