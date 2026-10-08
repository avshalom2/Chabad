import { getPool } from './db.js';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// Simple SHA-256 hash — replace with bcrypt in production for stronger security
function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export function passwordNeedsUpgrade(storedHash) {
  return !String(storedHash || '').startsWith('scrypt$');
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
    sql += ` WHERE u.is_active = ${isPostgres() ? 'TRUE' : '1'}`;
  }
  sql += ' ORDER BY u.created_at DESC';

  const result = await pool.query(sql, params);
  return queryRows(result);
}

// ── GET SINGLE USER BY ID ────────────────────────────────────
export async function getUserById(id) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, u.display_name, u.is_active, u.created_at,
            al.name AS access_level, al.can_create, al.can_update, al.can_delete, al.can_publish
     FROM users u
     JOIN access_levels al ON al.id = u.access_level_id
     WHERE u.id = ${isPostgres() ? '$1' : '?'}`,
    [id]
  );
  const rows = queryRows(result);
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
  if (isPostgres()) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, access_level_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [username, email, password_hash, display_name, access_level_id]
    );
    return result.rows[0].id;
  }
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password_hash, display_name, access_level_id)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, password_hash, display_name, access_level_id]
  );
  return result.insertId;
}

// ── UPDATE USER ──────────────────────────────────────────────
export async function updateUser(id, fields) {
  const pool = await getPool();
  const allowed = ['username', 'email', 'display_name', 'access_level_id', 'is_active'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (updates.length === 0) throw new Error('No valid fields to update');

  const sql = isPostgres()
    ? `UPDATE users SET ${updates.map((k, index) => `${k} = $${index + 1}`).join(', ')} WHERE id = $${updates.length + 1}`
    : `UPDATE users SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
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
  const normalizedHash = String(storedHash || '');

  if (normalizedHash.startsWith('scrypt$')) {
    const [, saltHex, expectedHex] = normalizedHash.split('$');
    if (!saltHex || !expectedHex) return false;

    try {
      const expected = Buffer.from(expectedHex, 'hex');
      const actual = scryptSync(plainPassword, Buffer.from(saltHex, 'hex'), expected.length);
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  const legacyHash = createHash('sha256').update(plainPassword).digest('hex');
  const expected = Buffer.from(normalizedHash, 'utf8');
  const actual = Buffer.from(legacyHash, 'utf8');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ── DEACTIVATE USER (soft delete) ────────────────────────────
export async function deactivateUser(id) {
  const pool = await getPool();
  await pool.query(
    isPostgres() ? 'UPDATE users SET is_active = FALSE WHERE id = $1' : 'UPDATE users SET is_active = 0 WHERE id = ?',
    [id]
  );
}

// ── GET ALL ACCESS LEVELS ────────────────────────────────────
export async function getAccessLevels() {
  const pool = await getPool();
  const result = await pool.query('SELECT * FROM access_levels ORDER BY id ASC');
  return queryRows(result);
}

function isPostgres() {
  return process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg';
}

function queryRows(result) {
  return isPostgres() ? result.rows : result[0];
}
