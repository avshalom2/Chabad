-- PostgreSQL: add an optional URL override for category links.
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS custom_url VARCHAR(500) DEFAULT NULL;
