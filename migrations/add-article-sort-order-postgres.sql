-- PostgreSQL: optional manual order for articles in related-article lists.
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;
