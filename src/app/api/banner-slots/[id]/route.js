import { getBannerSlotWithBanners } from '@/lib/banner-slots.js';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const slot = await getBannerSlotWithBanners(id, true);

    if (!slot) {
      return Response.json({ error: 'Banner slot not found' }, { status: 404 });
    }

    return Response.json(slot, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Public banner slot error:', error);
    return Response.json({ error: 'Failed to load banner' }, { status: 500 });
  }
}
