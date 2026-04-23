-- Site Settings Table
-- Key-value store for site-wide configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Setting key (e.g., "homepage_content", "homepage_banners")',
  `value` LONGTEXT COMMENT 'Setting value - can be JSON for complex data',
  description VARCHAR(255) COMMENT 'Description of what this setting controls',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT IGNORE INTO site_settings (`key`, `value`, description) VALUES
('homepage_content', '{"blocks": []}', 'Homepage main content blocks for PageBuilder editor'),
('homepage_banners', '[]', 'Homepage banner carousel - array of {image_url, title}'),
('site_color_primary', '#0066cc', 'Primary brand color');
