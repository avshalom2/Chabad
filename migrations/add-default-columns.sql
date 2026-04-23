-- Add default_columns field to categories table
-- This allows admins to set a default column count for category display

ALTER TABLE categories 
ADD COLUMN default_columns INT NOT NULL DEFAULT 3 AFTER sort_order;
