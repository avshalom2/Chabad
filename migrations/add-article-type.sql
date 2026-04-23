-- Add article_type column to distinguish between regular articles and galleries
ALTER TABLE articles ADD COLUMN article_type ENUM('article', 'gallery') DEFAULT 'article' AFTER category_id;

-- Create index for filtering by type
CREATE INDEX idx_articles_type ON articles(article_type);

-- Optional: Set existing articles as 'article' type (already the default)
-- UPDATE articles SET article_type = 'article' WHERE article_type IS NULL;
