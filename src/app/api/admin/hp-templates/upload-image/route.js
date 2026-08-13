import { getCurrentUserSession } from '@/lib/auth-session.js';
import { uploadImageToCloudinary } from '@/lib/cloudinary.js';
import { upsertMediaAsset } from '@/lib/media-assets.js';

export async function POST(request) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const result = await uploadImageToCloudinary(file);
    const asset = await upsertMediaAsset(result);

    return Response.json({
      success: true,
      url: result.secure_url,
      fileName: result.display_name || result.public_id.split('/').pop(),
      publicId: result.public_id,
      assetId: asset.id,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
