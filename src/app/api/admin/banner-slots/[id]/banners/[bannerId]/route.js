import {
  getBanner,
  updateBanner,
  deleteBanner,
  recordBannerClick,
} from '@/lib/banner-slots.js';

/**
 * GET - Fetch a specific banner
 */
export async function GET(request, { params }) {
  try {
    const { bannerId } = await params;
    const banner = await getBanner(bannerId);

    if (!banner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 });
    }

    return Response.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Update a banner
 */
export async function PUT(request, { params }) {
  try {
    const { bannerId } = await params;
    const body = await request.json();

    const banner = await getBanner(bannerId);
    if (!banner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 });
    }

    const updatedBanner = await updateBanner(bannerId, body);
    return Response.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Delete a banner
 */
export async function DELETE(request, { params }) {
  try {
    const { bannerId } = await params;

    const banner = await getBanner(bannerId);
    if (!banner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 });
    }

    await deleteBanner(bannerId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH - Record a banner click
 */
export async function PATCH(request, { params }) {
  try {
    const { bannerId } = await params;
    const banner = await getBanner(bannerId);

    if (!banner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 });
    }

    await recordBannerClick(bannerId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error recording banner click:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
