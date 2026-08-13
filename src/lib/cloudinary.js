import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'chabad/uploads';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadImageToCloudinary(file) {
  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function listCloudinaryImages() {
  configureCloudinary();

  const result = await cloudinary.api.resources({
    type: 'upload',
    resource_type: 'image',
    prefix: `${CLOUDINARY_FOLDER}/`,
    max_results: 200,
  });

  return result.resources.map((asset) => ({
    src: asset.secure_url,
    name: asset.display_name || asset.public_id.split('/').pop(),
    publicId: asset.public_id,
    updatedAt: Date.parse(asset.created_at) || 0,
    storage: 'cloudinary',
  }));
}

export async function listCloudinaryAssets({ nextCursor, maxResults = 60 } = {}) {
  configureCloudinary();
  const result = await cloudinary.api.resources({
    type: 'upload', resource_type: 'image', prefix: `${CLOUDINARY_FOLDER}/`,
    max_results: Math.min(Math.max(Number(maxResults) || 60, 1), 100),
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
  return {
    assets: result.resources.map((asset) => ({
      publicId: asset.public_id, name: asset.display_name || asset.public_id.split('/').pop(),
      src: asset.secure_url, format: asset.format, width: asset.width, height: asset.height,
      bytes: asset.bytes, createdAt: asset.created_at,
    })),
    nextCursor: result.next_cursor || null,
  };
}

export async function deleteCloudinaryImages(publicIds) {
  configureCloudinary();
  const folderPrefix = `${CLOUDINARY_FOLDER}/`;
  const uniqueIds = [...new Set(publicIds.map((id) => String(id || '').trim()))];
  if (!uniqueIds.length || uniqueIds.some((id) => !id.startsWith(folderPrefix))) {
    throw new Error('Only images from the configured upload folder can be deleted');
  }
  if (uniqueIds.length > 100) throw new Error('A maximum of 100 images can be deleted at once');
  const result = await cloudinary.api.delete_resources(uniqueIds, {
    type: 'upload', resource_type: 'image', invalidate: true,
  });
  return result.deleted || {};
}
