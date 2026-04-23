-- Paste this into the PostgreSQL SQL editor.
-- Generated from MySQL recurring_events table.
-- Rows: 2

INSERT INTO recurring_events (id, title, description, event_type, event_time, location, is_active, days_of_week, created_by, created_at, updated_at) VALUES
(1, '×©×™×¢×•×¨ ×¢× ×”×¨×‘ ×ž× ×—× ×ž×™×™×“× ×¦''×™×§', '', 'class', '09:10:00', '', TRUE, '[1,2,0]'::jsonb, NULL, '2026-04-05 07:01:23', '2026-04-05 08:17:20'),
(2, '×ª× ×™× ×¢× ×”×¨×‘ ×¤×–', '', 'class', '10:30:00', '', TRUE, '[0]'::jsonb, NULL, '2026-04-05 07:18:14', '2026-04-05 08:28:14')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_type = EXCLUDED.event_type,
  event_time = EXCLUDED.event_time,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  days_of_week = EXCLUDED.days_of_week,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

SELECT setval(
  pg_get_serial_sequence('recurring_events', 'id'),
  COALESCE((SELECT MAX(id) FROM recurring_events), 1),
  true
);

