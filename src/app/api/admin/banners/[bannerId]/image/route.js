import { getCurrentUserSession } from '@/lib/auth-session.js';
import { getBanner, updateBanner } from '@/lib/banner-slots.js';
import { uploadImageToCloudinary } from '@/lib/cloudinary.js';
import { upsertMediaAsset } from '@/lib/media-assets.js';

const MAX_BANNER_FILE_SIZE = 500 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.access_level !== 'admin' || !session.can_update) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bannerId } = await params;
    const banner = await getBanner(bannerId);
    if (!banner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No image selected' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'Only JPEG, PNG, or WebP images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_BANNER_FILE_SIZE) {
      return Response.json({ error: 'Image must be 500 KB or smaller' }, { status: 400 });
    }

    const uploaded = await uploadImageToCloudinary(file);
    await upsertMediaAsset(uploaded);
    await updateBanner(bannerId, { ...banner, image_url: uploaded.secure_url });

    return Response.json({ success: true, url: uploaded.secure_url });
  } catch (error) {
    console.error('Inline banner image update failed:', error);
    return Response.json({ error: 'Failed to update banner image' }, { status: 500 });
  }
}
