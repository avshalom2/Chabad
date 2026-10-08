import { getRoshHashanahGuide } from '../../../../../lib/rosh-hashanah-guide.js';

export const dynamic = 'force-dynamic';

export function GET(request) {
  const { filename } = getRoshHashanahGuide();
  if (!filename) {
    return new Response('The guide for this year is not available yet.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(`/uploads/holidays/${filename}`, request.url).toString(),
      'Cache-Control': 'no-store',
    },
  });
}
