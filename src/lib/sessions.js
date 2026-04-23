import { getPool } from './db.js';
import { randomBytes } from 'crypto';

// ── CREATE SESSION ───────────────────────────────────────────
export async function createSession(userId, ipAddress, userAgent) {
  const pool = await getPool();
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    await pool.query(
      'INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [sessionId, userId, sessionId, ipAddress, userAgent, expiresAt]
    );
  } else {
    await pool.query(
      'INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, userId, sessionId, ipAddress, userAgent, expiresAt]
    );
  }

  return sessionId;
}

// ── GET SESSION ──────────────────────────────────────────────
export async function getSession(sessionId) {
  const pool = await getPool();
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    const result = await pool.query(
      `SELECT s.*, u.id as user_id, u.email, u.username, u.display_name, u.access_level_id,
              al.name as access_level, al.can_create, al.can_update, al.can_delete, al.can_publish
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       JOIN access_levels al ON al.id = u.access_level_id
       WHERE s.id = $1 AND s.expires_at > NOW() AND u.is_active = TRUE`,
      [sessionId]
    );
    return result.rows[0] || null;
  }

  const [rows] = await pool.query(
    `SELECT s.*, u.id as user_id, u.email, u.username, u.display_name, u.access_level_id,
            al.name as access_level, al.can_create, al.can_update, al.can_delete, al.can_publish
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN access_levels al ON al.id = u.access_level_id
     WHERE s.id = ? AND s.expires_at > NOW() AND u.is_active = 1`,
    [sessionId]
  );
  return rows[0] || null;
}

// ── DELETE SESSION ───────────────────────────────────────────
export async function deleteSession(sessionId) {
  const pool = await getPool();
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    return;
  }
  await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
}

// ── DELETE ALL SESSIONS (logout all devices) ──────────────────
export async function deleteAllUserSessions(userId) {
  const pool = await getPool();
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    return;
  }
  await pool.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

// ── CLEANUP EXPIRED SESSIONS ─────────────────────────────────
export async function cleanupExpiredSessions() {
  const pool = await getPool();
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
    return;
  }
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
}
