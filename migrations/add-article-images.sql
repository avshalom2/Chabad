-- Create article_images table for managing multiple images per article
CREATE TABLE IF NOT EXISTS article_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX (article_id),
  INDEX (display_order)
);

-- Add short_description_image column to articles table
ALTER TABLE articles ADD COLUMN short_description_image VARCHAR(500) AFTER featured_image;

-- Create index on new column
CREATE INDEX idx_short_desc_image ON articles(short_description_image);
