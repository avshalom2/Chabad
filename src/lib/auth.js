import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// ── CREATE JWT TOKEN ─────────────────────────────────────────
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      access_level: user.access_level,
      permissions: {
        can_create: user.can_create,
        can_update: user.can_update,
        can_delete: user.can_delete,
        can_publish: user.can_publish,
      },
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// ── VERIFY JWT TOKEN ────────────────────────────────────────
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ── SET AUTH COOKIE ─────────────────────────────────────────
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// ── GET AUTH COOKIE ─────────────────────────────────────────
export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

// ── CLEAR AUTH COOKIE (logout) ──────────────────────────────
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// ── GET CURRENT USER (from cookie) ──────────────────────────
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}
