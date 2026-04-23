import { cookies } from 'next/headers';
import { getSession } from './sessions.js';

export async function getCurrentUserSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    console.log('🔍 [AUTH-SESSION] Looking for session cookie');
    console.log('   Session ID:', sessionId ? sessionId.substring(0, 20) + '...' : 'NOT FOUND');

    if (!sessionId) {
      console.log('   ❌ No session ID in cookies');
      return null;
    }

    const session = await getSession(sessionId);
    console.log('   Session lookup result:', session ? `✅ Found: ${session.email}` : '❌ Not found in DB');
    return session || null;
  } catch (error) {
    console.error('❌ [AUTH-SESSION] Error:', error.message);
    return null;
  }
}
