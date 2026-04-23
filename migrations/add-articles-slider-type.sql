-- Add articles-slider category type
INSERT INTO category_types (name, slug) VALUES ('articles-slider', 'articles-slider')
ON DUPLICATE KEY UPDATE id=id;
