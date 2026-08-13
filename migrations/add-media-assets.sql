CREATE TABLE IF NOT EXISTS media_assets (
  id BIGSERIAL PRIMARY KEY,
  cloudinary_public_id VARCHAR(500) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  filename VARCHAR(500),
  format VARCHAR(50),
  width INTEGER,
  height INTEGER,
  bytes BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cloudinary_created_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_references (
  id BIGSERIAL PRIMARY KEY,
  asset_id BIGINT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  source_table VARCHAR(100) NOT NULL,
  source_column VARCHAR(100) NOT NULL,
  source_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (asset_id, source_table, source_column, source_id)
);

CREATE INDEX IF NOT EXISTS idx_media_references_asset_id ON media_references(asset_id);

ALTER TABLE banners ADD COLUMN IF NOT EXISTS asset_id BIGINT REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE article_images ADD COLUMN IF NOT EXISTS asset_id BIGINT REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS asset_id BIGINT REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS asset_id BIGINT REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_asset_id BIGINT REFERENCES media_assets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_banners_asset_id ON banners(asset_id);
CREATE INDEX IF NOT EXISTS idx_article_images_asset_id ON article_images(asset_id);
