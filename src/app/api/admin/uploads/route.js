import { readdir } from 'fs/promises';
import { join } from 'path';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);
    const images = files
      .filter(f => IMAGE_EXTS.has(f.slice(f.lastIndexOf('.')).toLowerCase()))
      .map(f => ({ src: `/uploads/${f}`, name: f }));
    return Response.json(images);
  } catch {
    return Response.json([]);
  }
}
