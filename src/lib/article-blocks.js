import { getPool } from "./db.js";

export async function getArticleBlocks(articleId) {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM article_blocks WHERE article_id = ? ORDER BY sort_order ASC",
    [articleId]
  );
  return rows.map((r) => ({ ...r, data: JSON.parse(r.data) }));
}

export async function createBlock(articleId, blockType, data, sortOrder) {
  const pool = await getPool();
  const [result] = await pool.query(
    "INSERT INTO article_blocks (article_id, block_type, data, sort_order) VALUES (?, ?, ?, ?)",
    [articleId, blockType, JSON.stringify(data), sortOrder]
  );
  return result.insertId;
}

export async function updateBlock(blockId, data) {
  const pool = await getPool();
  await pool.query(
    "UPDATE article_blocks SET data = ?, updated_at = NOW() WHERE id = ?",
    [JSON.stringify(data), blockId]
  );
  return true;
}

export async function deleteBlock(blockId) {
  const pool = await getPool();
  await pool.query("DELETE FROM article_blocks WHERE id = ?", [blockId]);
  return true;
}

export async function reorderBlocks(blocks) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const { id, sort_order } of blocks) {
      await conn.query("UPDATE article_blocks SET sort_order = ? WHERE id = ?", [
        sort_order,
        id,
      ]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
