-- Add article template and main article fields
ALTER TABLE articles 
ADD COLUMN template VARCHAR(50) NOT NULL DEFAULT 'standard' AFTER status,
ADD COLUMN is_main_article BOOLEAN NOT NULL DEFAULT 0 AFTER template;

-- Create index for main article queries
CREATE INDEX idx_is_main_article ON articles(is_main_article, category_id);
CREATE INDEX idx_template ON articles(template);
