import { deleteCloudinaryImages, listCloudinaryAssets } from '@/lib/cloudinary.js';
import { getMediaUsage, refreshMediaReferences, removeMediaAssetRecords, syncMediaAssets } from '@/lib/media-assets.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = await listCloudinaryAssets({
      nextCursor: searchParams.get('cursor') || undefined,
      maxResults: searchParams.get('limit') || 60,
    });
    await syncMediaAssets(page.assets);
    await refreshMediaReferences();
    const usage = await getMediaUsage(page.assets.map((asset) => asset.publicId));
    return Response.json({ ...page, assets: page.assets.map((asset) => ({
      ...asset,
      usageCount: usage.get(asset.publicId)?.usage_count || 0,
      references: usage.get(asset.publicId)?.references || [],
    })) });
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
    await refreshMediaReferences();
    const usage = await getMediaUsage(publicIds);
    const inUse = publicIds.filter((id) => (usage.get(id)?.usage_count || 0) > 0);
    if (inUse.length) {
      return Response.json({ error: 'Referenced images cannot be deleted', inUse }, { status: 409 });
    }
    const deleted = await deleteCloudinaryImages(publicIds);
    const failed = publicIds.filter((id) => !['deleted', 'not_found'].includes(deleted[id]));
    await removeMediaAssetRecords(publicIds.filter((id) => !failed.includes(id)));
    return Response.json({ success: !failed.length, deleted, failed }, { status: failed.length ? 207 : 200 });
  } catch (error) {
    console.error('Failed to delete Cloudinary assets:', error);
    return Response.json({ error: error.message || 'Failed to delete images' }, { status: 500 });
  }
}
