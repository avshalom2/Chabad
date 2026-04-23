-- ============================================================
-- Chabad Website Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS chabad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chabad_db;

-- ============================================================
-- 1. ACCESS LEVELS
-- Defines user permission roles (admin, editor, publisher, etc.)
-- ============================================================
CREATE TABLE access_levels (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)   NOT NULL UNIQUE,          -- e.g. 'admin', 'editor', 'publisher'
  can_create  TINYINT(1)    NOT NULL DEFAULT 0,
  can_update  TINYINT(1)    NOT NULL DEFAULT 0,
  can_delete  TINYINT(1)    NOT NULL DEFAULT 0,
  can_publish TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Default roles
INSERT INTO access_levels (name, can_create, can_update, can_delete, can_publish) VALUES
  ('admin',     1, 1, 1, 1),
  ('editor',    1, 1, 0, 1),
  ('publisher', 0, 0, 0, 1),
  ('viewer',    0, 0, 0, 0);

-- ============================================================
-- 2. USERS
-- Site content managers
-- ============================================================
CREATE TABLE users (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50)   NOT NULL UNIQUE,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  display_name    VARCHAR(100)  DEFAULT NULL,
  access_level_id INT UNSIGNED  NOT NULL DEFAULT 4,  -- default: viewer
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_access_level FOREIGN KEY (access_level_id)
    REFERENCES access_levels (id) ON UPDATE CASCADE
);

-- ============================================================
-- 2. SESSIONS
-- Server-side session storage for authentication
-- ============================================================
CREATE TABLE sessions (
  id            VARCHAR(255)  PRIMARY KEY,
  user_id       INT UNSIGNED  NOT NULL,
  token         VARCHAR(500)  NOT NULL,
  ip_address    VARCHAR(45)   DEFAULT NULL,
  user_agent    VARCHAR(255)  DEFAULT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP     NOT NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires (expires_at)
);

-- ============================================================
-- 3. CATEGORY TYPES
-- Defines what kind of content a category holds
-- e.g. 'articles', 'products', 'news' — easily extendable
-- ============================================================
CREATE TABLE category_types (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)   NOT NULL UNIQUE,   -- 'articles', 'products', 'news'
  slug       VARCHAR(50)   NOT NULL UNIQUE,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO category_types (name, slug) VALUES
  ('articles', 'articles'),
  ('products', 'products'),
  ('news', 'news');

-- ============================================================
-- 4. CATEGORIES
-- Shared category table for all content types
-- Supports nested categories via parent_id
-- ============================================================
CREATE TABLE categories (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  slug             VARCHAR(120)  NOT NULL UNIQUE,
  description      TEXT          DEFAULT NULL,
  category_type_id INT UNSIGNED  NOT NULL,
  parent_id        INT UNSIGNED  DEFAULT NULL,   -- NULL = top-level category
  image_url        VARCHAR(255)  DEFAULT NULL,
  is_active        TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order       INT           NOT NULL DEFAULT 0,
  created_by       INT UNSIGNED  DEFAULT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_type   FOREIGN KEY (category_type_id)
    REFERENCES category_types (id) ON UPDATE CASCADE,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
    REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_categories_user   FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL
);

-- ============================================================
-- 5. ARTICLES
-- ============================================================
CREATE TABLE articles (
  id                INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title             VARCHAR(255)  NOT NULL,
  slug              VARCHAR(280)  NOT NULL UNIQUE,
  excerpt           TEXT          DEFAULT NULL,
  short_description TEXT          DEFAULT NULL,
  content           LONGTEXT      DEFAULT NULL,
  category_id    INT UNSIGNED  NOT NULL,
  author_id      INT UNSIGNED  DEFAULT NULL,
  featured_image VARCHAR(255)  DEFAULT NULL,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at   TIMESTAMP     DEFAULT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON UPDATE CASCADE,
  CONSTRAINT fk_articles_author   FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE SET NULL
);

-- ============================================================
-- 6. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id             INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)    NOT NULL,
  slug           VARCHAR(280)    NOT NULL UNIQUE,
  description    TEXT            DEFAULT NULL,
  category_id    INT UNSIGNED    NOT NULL,
  price          DECIMAL(10, 2)  DEFAULT NULL,
  image_url      VARCHAR(255)    DEFAULT NULL,
  stock          INT             DEFAULT NULL,   -- NULL = unlimited / not tracked
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_by     INT UNSIGNED    DEFAULT NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON UPDATE CASCADE,
  CONSTRAINT fk_products_user     FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL
);

-- ============================================================
-- 7. PAGES
-- Landing pages, custom content pages with flexible block builder
-- ============================================================
CREATE TABLE pages (
  id             INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)  NOT NULL,
  slug           VARCHAR(280)  NOT NULL UNIQUE,
  description    TEXT          DEFAULT NULL,
  meta_title     VARCHAR(255)  DEFAULT NULL,
  meta_description VARCHAR(500) DEFAULT NULL,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_by     INT UNSIGNED  DEFAULT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at   TIMESTAMP     DEFAULT NULL,
  CONSTRAINT fk_pages_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL
);

-- ============================================================
-- 8. PAGE BLOCKS
-- Flexible content blocks for pages (text, hero, testimonials, etc.)
-- ============================================================
CREATE TABLE page_blocks (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  page_id      INT UNSIGNED  NOT NULL,
  block_type   VARCHAR(50)   NOT NULL,  -- 'text', 'hero', 'values', 'testimonial', etc.
  sort_order   INT           NOT NULL DEFAULT 0,
  data         LONGTEXT      NOT NULL,  -- JSON data for the block
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_blocks_page FOREIGN KEY (page_id)
    REFERENCES pages (id) ON DELETE CASCADE,
  INDEX idx_blocks_page (page_id)
);

-- ============================================================
-- 9. EVENTS
-- One-time or single events with specific date and time
-- ============================================================
CREATE TABLE events (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          DEFAULT NULL,
  event_type      ENUM('prayer','lecture','class','service','other') NOT NULL DEFAULT 'other',
  event_date      DATE          NOT NULL,
  event_time      TIME          NOT NULL,
  location        VARCHAR(255)  DEFAULT NULL,
  created_by      INT UNSIGNED  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_events_date (event_date),
  INDEX idx_events_type (event_type)
);

-- ============================================================
-- 10. RECURRING EVENTS
-- Daily/weekly recurring events that repeat on specified days
-- ============================================================
CREATE TABLE recurring_events (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          DEFAULT NULL,
  event_type      ENUM('prayer','lecture','class','service','other') NOT NULL DEFAULT 'other',
  event_time      TIME          NOT NULL,
  location        VARCHAR(255)  DEFAULT NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  -- Recurring days: JSON array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
  days_of_week    JSON          NOT NULL,  -- e.g. [0,2,4,6] for Sun, Tue, Thu, Sat
  created_by      INT UNSIGNED  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recurring_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_recurring_active (is_active)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_articles_status      ON articles  (status);
CREATE INDEX idx_articles_category    ON articles  (category_id);
CREATE INDEX idx_products_status      ON products  (status);
CREATE INDEX idx_products_category    ON products  (category_id);
CREATE INDEX idx_categories_type      ON categories (category_type_id);
CREATE INDEX idx_categories_parent    ON categories (parent_id);
CREATE INDEX idx_pages_status         ON pages (status);
CREATE INDEX idx_pages_slug           ON pages (slug);

-- ============================================================
-- 11. HOMEPAGE TEMPLATES
-- Store homepage template structure and edited versions
-- ============================================================
CREATE TABLE hp_templates (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  template_name   VARCHAR(255)  NOT NULL UNIQUE,
  template_html   LONGTEXT      NOT NULL,  -- Original template structure
  homepage_html   LONGTEXT      DEFAULT NULL,  -- Edited/current version
  is_active       TINYINT(1)    NOT NULL DEFAULT 0,
  created_by      INT UNSIGNED  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hp_templates_user FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_hp_templates_active (is_active)
);
