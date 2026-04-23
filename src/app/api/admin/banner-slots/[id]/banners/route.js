import {
  getBannersBySlot,
  createBanner,
  getBannerSlot,
  reorderBanners,
} from '@/lib/banner-slots.js';

/**
 * GET - Fetch all banners for a specific slot
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true';

    const slot = await getBannerSlot(id);
    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    const banners = await getBannersBySlot(id, activeOnly);
    return Response.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Create a new banner in a slot
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const slot = await getBannerSlot(id);
    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    const { title, image_url, link_url, alt_text, description, is_active, sort_order } = body;

    // Validate required fields
    if (!image_url) {
      return Response.json(
        { error: 'image_url is required' },
        { status: 400 }
      );
    }

    // Get user ID from session (TODO: implement proper session auth)
    const userId = 1;

    const banner = await createBanner(
      {
        banner_slot_id: parseInt(id),
        title,
        image_url,
        link_url,
        alt_text,
        description,
        is_active,
        sort_order,
      },
      userId
    );

    return Response.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Reorder banners
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bannerIds } = body;

    if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
      return Response.json(
        { error: 'bannerIds array is required' },
        { status: 400 }
      );
    }

    await reorderBanners(bannerIds);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error reordering banners:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
