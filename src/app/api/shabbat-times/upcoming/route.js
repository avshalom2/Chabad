import { NextResponse } from 'next/server';
import { buildShabbatRows, getHebcalData, israelDateKey } from '@/lib/shabbat-times';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = israelDateKey();
    const year = Number(today.slice(0, 4));
    const data = await getHebcalData(year);
    let upcoming = buildShabbatRows(data.items || [], today)[0];
    if (!upcoming) {
      const nextYear = await getHebcalData(year + 1);
      upcoming = buildShabbatRows(nextYear.items || [], today)[0];
    }
    return NextResponse.json({ upcoming: upcoming || null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to load upcoming Shabbat:', error);
    return NextResponse.json({ upcoming: null }, { status: 502 });
  }
}
