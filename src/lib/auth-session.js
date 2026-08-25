import { cookies } from 'next/headers';
import { getSession } from './sessions.js';

export async function getCurrentUserSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const session = await getSession(sessionId);
    return session || null;
  } catch (error) {
    console.error('Session validation failed:', error.message);
    return null;
  }
}
