import { NextResponse } from 'next/server';
import { getRabbiClassVideos } from '@/lib/youtube';

export async function GET() {
  const { videos, error } = await getRabbiClassVideos();

  return NextResponse.json(
    { videos: videos.slice(0, 20), error },
    { status: error ? 503 : 200 }
  );
}
