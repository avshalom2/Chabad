import { getArticleImages, addArticleImage, deleteArticleImage, updateArticleImage, reorderArticleImages } from '@/lib/articles.js';
import { getCurrentUserSession } from '@/lib/auth-session.js';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await params;
    const images = await getArticleImages(parseInt(articleId));

    return Response.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return Response.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await params;
    const body = await request.json();
    const { imageUrl, altText } = body;

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const image = await addArticleImage(parseInt(articleId), imageUrl, altText || null);

    return Response.json({ success: true, image }, { status: 201 });
  } catch (error) {
    console.error('Error adding image:', error);
    return Response.json({ 
      error: `Failed to add image: ${error.message}`,
      details: error.code || ''
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, images, imageId, altText } = body;

    if (action === 'reorder') {
      await reorderArticleImages(images);
      return Response.json({ success: true });
    }

    if (action === 'updateAlt') {
      await updateArticleImage(imageId, altText);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating images:', error);
    return Response.json({ error: 'Failed to update images' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return Response.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const success = await deleteArticleImage(imageId);

    if (!success) {
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return Response.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
