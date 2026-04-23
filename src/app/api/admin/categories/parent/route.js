import { getCategories } from '@/lib/categories.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET() {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all categories with their parent relationships
    const categories = await getCategories({ activeOnly: false });
    
    // Build hierarchy information
    const buildTree = (cats) => {
      const map = {};
      const roots = [];

      // First pass: create a map of all categories
      cats.forEach((cat) => {
        map[cat.id] = { ...cat, children: [] };
      });

      // Second pass: build the tree and mark levels
      cats.forEach((cat) => {
        if (cat.parent_id && map[cat.parent_id]) {
          map[cat.parent_id].children.push(map[cat.id]);
        } else {
          roots.push(map[cat.id]);
        }
      });

      return roots;
    };

    const tree = buildTree(categories);

    // Flatten tree with level information for form display
    const flatList = [];
    const addToList = (cat, level = 0) => {
      flatList.push({ ...cat, level });
      cat.children.forEach((child) => addToList(child, level + 1));
    };
    tree.forEach((cat) => addToList(cat));

    return Response.json({ categories: flatList });
  } catch (error) {
    console.error('Get parent categories error:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

