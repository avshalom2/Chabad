ALTER TABLE weekly_prayer_schedule
  ADD COLUMN IF NOT EXISTS zmanim_week_start DATE NULL,
  ADD COLUMN IF NOT EXISTS zmanim_week_end DATE NULL,
  ADD COLUMN IF NOT EXISTS zmanim_data JSONB NULL,
  ADD COLUMN IF NOT EXISTS zmanim_updated_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_weekly_prayer_schedule_zmanim_range
  ON weekly_prayer_schedule(zmanim_week_start, zmanim_week_end);
