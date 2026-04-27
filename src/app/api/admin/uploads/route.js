import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);
    const images = await Promise.all(files
      .filter(f => IMAGE_EXTS.has(f.slice(f.lastIndexOf('.')).toLowerCase()))
      .map(async (f) => {
        const filePath = join(uploadDir, f);
        const fileStat = await stat(filePath);
        return { src: `/uploads/${f}`, name: f, updatedAt: fileStat.mtimeMs };
      }));

    images.sort((a, b) => b.updatedAt - a.updatedAt);

    return Response.json(images);
  } catch {
    return Response.json([]);
  }
}
