-- Add 'news' category type
INSERT INTO category_types (name, slug) VALUES ('news', 'news')
ON DUPLICATE KEY UPDATE name = VALUES(name);
