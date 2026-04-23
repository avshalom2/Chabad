import { getArticleById, updateArticle, deleteArticle } from '@/lib/articles.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await props.params;
    console.log('Fetching article ID:', articleId, 'type:', typeof articleId);
    
    const article = await getArticleById(articleId);
    
    console.log('Article found:', article);

    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    return Response.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return Response.json({ error: 'Failed to fetch article: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await props.params;
    const body = await request.json();
    const { title, slug, excerpt, short_description, short_description_image, content, category_id, featured_image, price, is_purchasable, stock, status, template, is_main_article, article_type } = body;

    // Verify article exists
    const article = await getArticleById(articleId);
    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (short_description !== undefined) updates.short_description = short_description;
    if (short_description_image !== undefined) updates.short_description_image = short_description_image;
    if (content !== undefined) updates.content = content;
    if (category_id !== undefined) updates.category_id = parseInt(category_id);
    if (featured_image !== undefined) updates.featured_image = featured_image;
    if (price !== undefined) updates.price = price ? parseFloat(price) : null;
    if (is_purchasable !== undefined) updates.is_purchasable = is_purchasable ? 1 : 0;
    if (stock !== undefined) updates.stock = stock ? parseInt(stock) : null;
    if (status !== undefined) updates.status = status;
    if (template !== undefined) updates.template = template;
    if (is_main_article !== undefined) updates.is_main_article = is_main_article ? 1 : 0;
    if (article_type !== undefined) updates.article_type = article_type;

    await updateArticle(articleId, updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update article error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return Response.json({ error: 'An article with that slug already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await props.params;

    // Verify article exists
    const article = await getArticleById(articleId);
    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    await deleteArticle(articleId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return Response.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
