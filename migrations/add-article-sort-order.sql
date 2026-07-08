-- MySQL: optional manual order for articles in related-article lists.
ALTER TABLE articles
ADD COLUMN sort_order INT DEFAULT NULL AFTER featured_image;
