import {
  getBannerSlot,
  updateBannerSlot,
  deleteBannerSlot,
  getBannerSlotWithBanners,
} from '@/lib/banner-slots.js';

/**
 * GET - Fetch a specific banner slot with banners
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const slot = await getBannerSlotWithBanners(id, activeOnly);

    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    return Response.json(slot);
  } catch (error) {
    console.error('Error fetching banner slot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Update a banner slot
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const slot = await getBannerSlot(id);
    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    const updatedSlot = await updateBannerSlot(id, body);
    return Response.json(updatedSlot);
  } catch (error) {
    console.error('Error updating banner slot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Delete a banner slot (cascades to banners)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const slot = await getBannerSlot(id);
    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    await deleteBannerSlot(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner slot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
