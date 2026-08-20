ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_date DATE DEFAULT NULL;

ALTER TABLE banners
  DROP CONSTRAINT IF EXISTS banners_display_dates_valid;

ALTER TABLE banners
  ADD CONSTRAINT banners_display_dates_valid
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

CREATE INDEX IF NOT EXISTS idx_banners_display_dates
  ON banners (start_date, end_date);
