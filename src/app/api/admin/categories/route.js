import { createCategory, getCategories } from '@/lib/categories.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET() {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all categories (all types: articles, products, news, etc.)
    const categories = await getCategories({ activeOnly: false });
    
    // Build hierarchy with level information
    const buildTree = (cats) => {
      const map = {};
      const roots = [];

      cats.forEach((cat) => {
        map[cat.id] = { ...cat, children: [] };
      });

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

    // Flatten tree with level information
    const flatList = [];
    const addToList = (cat, level = 0) => {
      flatList.push({ ...cat, level });
      cat.children.forEach((child) => addToList(child, level + 1));
    };
    tree.forEach((cat) => addToList(cat));

    return Response.json({ categories: flatList });
  } catch (error) {
    console.error('Get categories error:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, category_type_id, parent_id, is_menu, sort_order, default_columns } = body;

    if (!name || !slug || !category_type_id) {
      return Response.json(
        { error: 'Name, slug and category type are required' },
        { status: 400 }
      );
    }

    const id = await createCategory({
      name,
      slug,
      description: description || null,
      category_type_id: parseInt(category_type_id),
      parent_id: parent_id ? parseInt(parent_id) : null,
      is_menu: is_menu ? 1 : 0,
      sort_order: parseInt(sort_order) || 0,
      default_columns: default_columns ? parseInt(default_columns) : 3,
      created_by: user.user_id,
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return Response.json({ error: 'A category with that slug already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
