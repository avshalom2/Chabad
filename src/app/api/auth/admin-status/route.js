import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET() {
  const session = await getCurrentUserSession();
  const isAdmin = session?.access_level === 'admin';

  return Response.json(
    { canEditBanner: Boolean(isAdmin && session.can_update) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
