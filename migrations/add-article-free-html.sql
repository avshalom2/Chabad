-- Add article editing mode flag.
-- When true, the admin editor uses a raw HTML preview/code workflow instead of Tiptap.
ALTER TABLE articles ADD COLUMN is_free_html BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_articles_is_free_html ON articles(is_free_html);
