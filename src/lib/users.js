import { getPool } from './db.js';
import { createHash } from 'crypto';

// Simple SHA-256 hash — replace with bcrypt in production for stronger security
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// ── GET ALL USERS ────────────────────────────────────────────
export async function getUsers({ activeOnly = true } = {}) {
  const pool = await getPool();
  let sql = `
    SELECT u.id, u.username, u.email, u.display_name, u.is_active, u.created_at,
           al.name AS access_level, al.can_create, al.can_update, al.can_delete, al.can_publish
    FROM users u
    JOIN access_levels al ON al.id = u.access_level_id
  `;
  const params = [];
  if (activeOnly) {
    sql += ' WHERE u.is_active = 1';
  }
  sql += ' ORDER BY u.created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ── GET SINGLE USER BY ID ────────────────────────────────────
export async function getUserById(id) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.email, u.display_name, u.is_active, u.created_at,
            al.name AS access_level, al.can_create, al.can_update, al.can_delete, al.can_publish
     FROM users u
     JOIN access_levels al ON al.id = u.access_level_id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// ── GET USER BY EMAIL (for login) ────────────────────────────
export async function getUserByEmail(email) {
  const pool = await getPool();
  let rows;
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    const query = `SELECT u.*, al.name AS access_level,
            al.can_create, al.can_update, al.can_delete, al.can_publish
     FROM users u
     JOIN access_levels al ON al.id = u.access_level_id
     WHERE u.email = $1 AND u.is_active = TRUE`;
    const result = await pool.query(query, [email]);
    rows = result.rows;
  } else {
    const query = `SELECT u.*, al.name AS access_level,
            al.can_create, al.can_update, al.can_delete, al.can_publish
     FROM users u
     JOIN access_levels al ON al.id = u.access_level_id
     WHERE u.email = ? AND u.is_active = 1`;
    const [mysqlRows] = await pool.query(query, [email]);
    rows = mysqlRows;
  }
  return rows[0] || null;
}

// ── CREATE USER ──────────────────────────────────────────────
export async function createUser({ username, email, password, display_name = null, access_level_id = 4 }) {
  const pool = await getPool();
  const password_hash = hashPassword(password);
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password_hash, display_name, access_level_id)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, password_hash, display_name, access_level_id]
  );
  return result.insertId;
}

// ── UPDATE USER ──────────────────────────────────────────────
export async function updateUser(id, fields) {
  const allowed = ['username', 'email', 'display_name', 'access_level_id', 'is_active'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (updates.length === 0) throw new Error('No valid fields to update');

  const sql = `UPDATE users SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
  const values = [...updates.map(k => fields[k]), id];
  await pool.query(sql, values);
}

// ── CHANGE PASSWORD ──────────────────────────────────────────
export async function changePassword(id, newPassword) {
  const pool = await getPool();
  const password_hash = hashPassword(newPassword);
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
  } else {
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
  }
}

// ── VERIFY PASSWORD (for login) ──────────────────────────────
export async function verifyPassword(plainPassword, storedHash) {
  return hashPassword(plainPassword) === storedHash;
}

// ── DEACTIVATE USER (soft delete) ────────────────────────────
export async function deactivateUser(id) {
  await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
}

// ── GET ALL ACCESS LEVELS ────────────────────────────────────
export async function getAccessLevels() {
  const [rows] = await pool.query('SELECT * FROM access_levels ORDER BY id ASC');
  return rows;
}
