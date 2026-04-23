import {
  getBannerSlots,
  createBannerSlot,
  getBannerSlotWithBanners,
} from '@/lib/banner-slots.js';

/**
 * GET - Fetch all banner slots with their banners
 */
export async function GET(request) {
  try {
    const slots = await getBannerSlots();
    
    // Enrich each slot with its banners
    const slotsWithBanners = await Promise.all(
      slots.map(async (slot) => {
        const full = await getBannerSlotWithBanners(slot.id);
        return full;
      })
    );

    return Response.json(slotsWithBanners);
  } catch (error) {
    console.error('Error fetching banner slots:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Create a new banner slot
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      location,
      max_width,
      max_height,
      aspect_ratio,
      rotation_delay,
      design_type,
      is_active,
      sort_order,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return Response.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Get user ID from session (TODO: implement proper session auth)
    const userId = 1;

    const slot = await createBannerSlot(
      {
        name,
        slug,
        description,
        location,
        max_width,
        max_height,
        aspect_ratio,
        rotation_delay,
        design_type,
        is_active,
        sort_order,
      },
      userId
    );

    return Response.json(slot, { status: 201 });
  } catch (error) {
    console.error('Error creating banner slot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
