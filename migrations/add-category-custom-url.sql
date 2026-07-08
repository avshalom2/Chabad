-- MySQL: add an optional URL override for category links.
ALTER TABLE categories
ADD COLUMN custom_url VARCHAR(500) DEFAULT NULL AFTER image_url;
