import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getCurrentUserSession } from '@/lib/auth-session.js';
import { listCloudinaryImages } from '@/lib/cloudinary.js';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

export async function GET() {
  const user = await getCurrentUserSession();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [cloudImages, localImages] = await Promise.all([
      listCloudinaryImages(),
      listLocalImages(),
    ]);

    const images = [...cloudImages, ...localImages];

    images.sort((a, b) => b.updatedAt - a.updatedAt);

    return Response.json(images);
  } catch (error) {
    console.error('Failed to list uploaded images:', error);
    return Response.json({ error: 'Failed to list uploaded images' }, { status: 500 });
  }
}

async function listLocalImages() {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);

    return Promise.all(files
      .filter(f => IMAGE_EXTS.has(f.slice(f.lastIndexOf('.')).toLowerCase()))
      .map(async (f) => {
        const filePath = join(uploadDir, f);
        const fileStat = await stat(filePath);
        return {
          src: `/uploads/${f}`,
          name: f,
          updatedAt: fileStat.mtimeMs,
          storage: 'local',
        };
      }));
  } catch {
    return [];
  }
}
