import { getCategoryById, updateCategory } from '@/lib/categories.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const category = await getCategoryById(parseInt(id));

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    return Response.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return Response.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, category_type_id, parent_id, is_menu, sort_order, is_active, default_columns } = body;

    if (!name || !slug) {
      return Response.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Update the category
    await updateCategory(parseInt(id), {
      name,
      slug,
      description: description || null,
      category_type_id: category_type_id ? parseInt(category_type_id) : undefined,
      parent_id: parent_id ? parseInt(parent_id) : null,
      is_menu: is_menu ? 1 : 0,
      sort_order: parseInt(sort_order) || 0,
      is_active: is_active ? 1 : 0,
      default_columns: default_columns ? parseInt(default_columns) : 3,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return Response.json({ error: 'A category with that slug already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
