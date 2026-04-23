import { getCategoryTypes } from '@/lib/categories.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET() {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryTypes = await getCategoryTypes();
    return Response.json({ categoryTypes });
  } catch (error) {
    console.error('Get category types error:', error);
    return Response.json({ error: 'Failed to fetch category types' }, { status: 500 });
  }
}
