import { getPool } from "./db.js";

/**
 * Get all Q&A sets
 */
export async function getQnaSets() {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT * FROM qna_sets ORDER BY created_at DESC");
  return rows;
}

/**
 * Get Q&A set by ID with all items
 */
export async function getQnaSetById(id) {
  const pool = await getPool();
  const [set] = await pool.query("SELECT * FROM qna_sets WHERE id = ?", [id]);
  if (!set || set.length === 0) return null;

  const [items] = await pool.query(
    "SELECT * FROM qna_items WHERE qna_set_id = ? ORDER BY item_order ASC",
    [id]
  );

  return {
    ...set[0],
    items: items,
  };
}

/**
 * Get Q&A set by slug
 */
export async function getQnaSetBySlug(slug) {
  const pool = await getPool();
  const [set] = await pool.query("SELECT * FROM qna_sets WHERE slug = ?", [slug]);
  if (!set || set.length === 0) return null;

  const [items] = await pool.query(
    "SELECT * FROM qna_items WHERE qna_set_id = ? ORDER BY item_order ASC",
    [set[0].id]
  );

  return {
    ...set[0],
    items: items,
  };
}

/**
 * Create new Q&A set
 */
export async function createQnaSet(data) {
  const pool = await getPool();
  const { name, slug, description, createdBy } = data;

  const [result] = await pool.query(
    "INSERT INTO qna_sets (name, slug, description, created_by) VALUES (?, ?, ?, ?)",
    [name, slug, description, createdBy]
  );

  return getQnaSetById(result.insertId);
}

/**
 * Update Q&A set details
 */
export async function updateQnaSet(id, data) {
  const { name, description } = data;

  await pool.query("UPDATE qna_sets SET name = ?, description = ? WHERE id = ?", [
    name,
    description,
    id,
  ]);

  return getQnaSetById(id);
}

/**
 * Delete Q&A set (cascades to items)
 */
export async function deleteQnaSet(id) {
  await pool.query("DELETE FROM qna_sets WHERE id = ?", [id]);
  return true;
}

/**
 * Add Q&A item to set
 */
export async function addQnaItem(qnaSetId, itemData) {
  const { question, answer, itemOrder } = itemData;

  const [result] = await pool.query(
    "INSERT INTO qna_items (qna_set_id, question, answer, item_order) VALUES (?, ?, ?, ?)",
    [qnaSetId, question, answer, itemOrder]
  );

  return result.insertId;
}

/**
 * Update Q&A item
 */
export async function updateQnaItem(itemId, itemData) {
  const { question, answer, itemOrder } = itemData;

  await pool.query(
    "UPDATE qna_items SET question = ?, answer = ?, item_order = ? WHERE id = ?",
    [question, answer, itemOrder, itemId]
  );

  return true;
}

/**
 * Delete Q&A item
 */
export async function deleteQnaItem(itemId) {
  await pool.query("DELETE FROM qna_items WHERE id = ?", [itemId]);
  return true;
}

/**
 * Check if slug already exists
 */
export async function slugExists(slug, excludeId = null) {
  let query = "SELECT COUNT(*) as count FROM qna_sets WHERE slug = ?";
  const params = [slug];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [result] = await pool.query(query, params);
  return result[0].count > 0;
}
