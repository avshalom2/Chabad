import { createArticle, getArticles } from '@/lib/articles.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET(request) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all articles regardless of status for admin view
    const articles = await getArticles({ status: null, limit: 1000 });

    return Response.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return Response.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, short_description, content, category_id, featured_image, price, is_purchasable, stock, status, template, is_main_article, article_type } = body;

    if (!title || !category_id) {
      return Response.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    const baseSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || `article-${Date.now()}`;

    const articleData = {
      title,
      excerpt: excerpt || null,
      short_description: short_description || null,
      content: content || null,
      category_id: parseInt(category_id),
      author_id: user.user_id,
      featured_image: featured_image || null,
      price: price ? parseFloat(price) : null,
      is_purchasable: is_purchasable ? 1 : 0,
      stock: stock ? parseInt(stock) : null,
      status: status || 'draft',
      template: template || 'standard',
      is_main_article: is_main_article ? 1 : 0,
      article_type: article_type || 'article',
    };

    let id;
    let uniqueSlug = baseSlug;
    let attempt = 0;
    while (true) {
      try {
        id = await createArticle({ ...articleData, slug: uniqueSlug });
        break;
      } catch (dupError) {
        if (dupError.code === 'ER_DUP_ENTRY' && attempt < 10) {
          attempt++;
          uniqueSlug = `${baseSlug}-${attempt}`;
        } else {
          throw dupError;
        }
      }
    }

    return Response.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return Response.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
