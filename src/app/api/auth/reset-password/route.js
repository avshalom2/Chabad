import { createHash } from 'crypto';
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

async function execute(pool, query, params = []) {
  const [adaptedQuery, adaptedParams] = adaptPlaceholders(query, params);
  return pool.query(adaptedQuery, adaptedParams);
}

// Simple SHA-256 hash function
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const pool = await getPool();
    const body = await request.json();
    const { email, newPassword } = body;

    // Validate input
    if (!email || !newPassword) {
      return Response.json(
        { error: 'Email and new password required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check user exists
    const users = await queryRows(pool, 'SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash and update password
    const passwordHash = hashPassword(newPassword);
    await execute(pool, 'UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);

    return Response.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    );
  }
}
