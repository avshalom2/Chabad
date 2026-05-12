CREATE TABLE IF NOT EXISTS weekly_prayer_schedule (
  id SERIAL PRIMARY KEY,
  singleton_key SMALLINT NOT NULL DEFAULT 1,
  parasha_name VARCHAR(120) NOT NULL DEFAULT '',
  hebrew_date_from VARCHAR(30) NOT NULL DEFAULT '',
  hebrew_date_to VARCHAR(30) NOT NULL DEFAULT '',
  hebrew_month VARCHAR(40) NOT NULL DEFAULT '',
  gregorian_date_from DATE NULL,
  gregorian_date_to DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_prayer_schedule_singleton
  ON weekly_prayer_schedule(singleton_key);

CREATE TABLE IF NOT EXISTS weekly_prayer_times (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES weekly_prayer_schedule(id) ON DELETE CASCADE,
  prayer_type VARCHAR(30) NOT NULL,
  day_group VARCHAR(30) NOT NULL,
  time_value TIME NOT NULL,
  note VARCHAR(80) NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weekly_prayer_times_schedule
  ON weekly_prayer_times(schedule_id);

CREATE INDEX IF NOT EXISTS idx_weekly_prayer_times_group
  ON weekly_prayer_times(prayer_type, day_group, sort_order);
