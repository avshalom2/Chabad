-- Add optional WhatsApp button display flag for article pages.
ALTER TABLE articles ADD COLUMN show_whatsapp_button BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_articles_show_whatsapp_button ON articles(show_whatsapp_button);
