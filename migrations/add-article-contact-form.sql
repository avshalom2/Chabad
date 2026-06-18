-- Add optional contact form display flag for article pages.
ALTER TABLE articles ADD COLUMN show_contact_form BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_articles_show_contact_form ON articles(show_contact_form);
