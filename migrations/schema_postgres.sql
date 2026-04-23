-- PostgreSQL schema converted from MySQL
-- Only a sample for the first 3 tables, extend as needed

DROP TABLE IF EXISTS access_levels CASCADE;
CREATE TABLE access_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_update BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_publish BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO access_levels (id, name, can_create, can_update, can_delete, can_publish, created_at) VALUES
  (1, 'admin', TRUE, TRUE, TRUE, TRUE, '2026-03-26 13:49:38'),
  (2, 'editor', TRUE, TRUE, FALSE, TRUE, '2026-03-26 13:49:38'),
  (3, 'publisher', FALSE, FALSE, FALSE, TRUE, '2026-03-26 13:49:38'),
  (4, 'viewer', FALSE, FALSE, FALSE, FALSE, '2026-03-26 13:49:38');

DROP TABLE IF EXISTS article_images CASCADE;
CREATE TABLE article_images (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_article FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
);
-- Add INSERTs for article_images here

-- Continue for articles and other tables...
