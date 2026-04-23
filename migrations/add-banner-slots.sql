-- ============================================================
-- BANNER SLOTS and BANNERS
-- Banner slots are locations/containers across the website
-- Banners are individual rotating banners assigned to slots with URLs
-- ============================================================

-- Create banner_slots table
CREATE TABLE IF NOT EXISTS banner_slots (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL UNIQUE,        -- e.g. 'Homepage Hero', 'Sidebar Top'
  slug            VARCHAR(100)  NOT NULL UNIQUE,        -- URL-friendly identifier
  description     TEXT          DEFAULT NULL,
  location        VARCHAR(100)  DEFAULT NULL,           -- e.g. 'homepage', 'sidebar', 'footer'
  max_width       INT           DEFAULT 1200,           -- Max width in px
  max_height      INT           DEFAULT 300,            -- Max height in px
  aspect_ratio    VARCHAR(20)   DEFAULT '16:9',         -- e.g. '16:9', '4:3', '1:1'
  rotation_delay  INT           DEFAULT 5000,           -- Milliseconds between rotations
  design_type     VARCHAR(50)   DEFAULT 'auto-slide',   -- e.g., 'auto-slide', 'carousel-dots', 'carousel-arrows'
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order      INT           NOT NULL DEFAULT 0,
  created_by      INT UNSIGNED  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_banner_slots_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_banner_slots_active (is_active),
  INDEX idx_banner_slots_slug (slug)
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  banner_slot_id  INT UNSIGNED  NOT NULL,
  title           VARCHAR(255)  DEFAULT NULL,
  image_url       VARCHAR(255)  NOT NULL,
  link_url        VARCHAR(500)  DEFAULT NULL,           -- URL the banner directs to
  alt_text        VARCHAR(200)  DEFAULT NULL,           -- Alt text for accessibility
  description     TEXT          DEFAULT NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order      INT           NOT NULL DEFAULT 0,
  click_count     INT           NOT NULL DEFAULT 0,
  created_by      INT UNSIGNED  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_banners_slot FOREIGN KEY (banner_slot_id)
    REFERENCES banner_slots (id) ON DELETE CASCADE,
  CONSTRAINT fk_banners_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_banners_slot (banner_slot_id),
  INDEX idx_banners_active (is_active),
  INDEX idx_banners_sort_order (sort_order)
);

-- Create indexes for performance
CREATE INDEX idx_banner_slots_location ON banner_slots (location);
CREATE INDEX idx_banners_slot_active ON banners (banner_slot_id, is_active);
