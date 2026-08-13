import { getPool } from './db.js';

const DIRECT_SOURCES = [
  ['banners', 'image_url', 'asset_id'],
  ['article_images', 'image_url', 'asset_id'],
  ['categories', 'image_url', 'asset_id'],
  ['products', 'image_url', 'asset_id'],
  ['articles', 'featured_image', 'featured_asset_id'],
];
const EMBEDDED_SOURCES = [
  ['articles', 'content'], ['articles', 'page_html'],
  ['hp_templates', 'template_html'], ['hp_templates', 'homepage_html'],
  ['site_settings', 'value'],
];

export async function upsertMediaAsset(asset, client) {
  const pool = client || await getPool();
  const result = await pool.query(`
    INSERT INTO media_assets
      (cloudinary_public_id, url, filename, format, width, height, bytes, cloudinary_created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    ON CONFLICT (cloudinary_public_id) DO UPDATE SET
      url=EXCLUDED.url, filename=EXCLUDED.filename, format=EXCLUDED.format,
      width=EXCLUDED.width, height=EXCLUDED.height, bytes=EXCLUDED.bytes,
      cloudinary_created_at=EXCLUDED.cloudinary_created_at, updated_at=NOW()
    RETURNING *`, [asset.publicId || asset.public_id, asset.src || asset.secure_url,
      asset.name || asset.display_name, asset.format || null, asset.width || null,
      asset.height || null, asset.bytes || null, asset.createdAt || asset.created_at || null]);
  return result.rows[0];
}

export async function syncMediaAssets(cloudAssets) {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const asset of cloudAssets) await upsertMediaAsset(asset, client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function refreshMediaReferences() {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM media_references');
    for (const [table, column, assetColumn] of DIRECT_SOURCES) {
      await client.query(`UPDATE ${table} source SET ${assetColumn}=asset.id FROM media_assets asset WHERE source.${column}=asset.url`);
      await client.query(`INSERT INTO media_references(asset_id,source_table,source_column,source_id)
        SELECT asset.id,$1,$2,source.id::text FROM ${table} source JOIN media_assets asset ON source.${column}=asset.url
        ON CONFLICT DO NOTHING`, [table, column]);
    }
    for (const [table, column] of EMBEDDED_SOURCES) {
      await client.query(`INSERT INTO media_references(asset_id,source_table,source_column,source_id)
        SELECT asset.id,$1,$2,source.id::text FROM ${table} source JOIN media_assets asset
        ON source.${column} IS NOT NULL AND POSITION(asset.url IN source.${column}::text)>0 ON CONFLICT DO NOTHING`, [table, column]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function getMediaUsage(publicIds) {
  const pool = await getPool();
  const result = await pool.query(`SELECT asset.cloudinary_public_id,
    COUNT(ref.id)::int AS usage_count,
    COALESCE(json_agg(json_build_object('table',ref.source_table,'column',ref.source_column,'id',ref.source_id))
      FILTER (WHERE ref.id IS NOT NULL),'[]') AS references
    FROM media_assets asset LEFT JOIN media_references ref ON ref.asset_id=asset.id
    WHERE asset.cloudinary_public_id = ANY($1) GROUP BY asset.id`, [publicIds]);
  return new Map(result.rows.map((row) => [row.cloudinary_public_id, row]));
}

export async function removeMediaAssetRecords(publicIds) {
  const pool = await getPool();
  await pool.query('DELETE FROM media_assets WHERE cloudinary_public_id = ANY($1)', [publicIds]);
}
