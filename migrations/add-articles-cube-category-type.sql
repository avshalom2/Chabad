SELECT setval(
  pg_get_serial_sequence('category_types', 'id'),
  COALESCE((SELECT MAX(id) FROM category_types), 1)
);

INSERT INTO category_types (name, slug)
VALUES ('Articles Cube', 'articles-cube')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
