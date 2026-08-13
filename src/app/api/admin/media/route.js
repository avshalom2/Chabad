import { deleteCloudinaryImages, listCloudinaryAssets } from '@/lib/cloudinary.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    return Response.json(await listCloudinaryAssets({
      nextCursor: searchParams.get('cursor') || undefined,
      maxResults: searchParams.get('limit') || 60,
    }));
  } catch (error) {
    console.error('Failed to list Cloudinary assets:', error);
    return Response.json({ error: 'Failed to list Cloudinary assets' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { publicIds } = await request.json();
    if (!Array.isArray(publicIds) || !publicIds.length) {
      return Response.json({ error: 'Select at least one image' }, { status: 400 });
    }
    const deleted = await deleteCloudinaryImages(publicIds);
    const failed = publicIds.filter((id) => !['deleted', 'not_found'].includes(deleted[id]));
    return Response.json({ success: !failed.length, deleted, failed }, { status: failed.length ? 207 : 200 });
  } catch (error) {
    console.error('Failed to delete Cloudinary assets:', error);
    return Response.json({ error: error.message || 'Failed to delete images' }, { status: 500 });
  }
}
