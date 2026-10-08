import { getPool } from '../src/lib/db.js';
const pool = await getPool();
try {
  for (const [name, sql] of Object.entries({
    articles: "SELECT a.id,a.title,a.slug,a.status,a.category_id,c.name AS category FROM articles a LEFT JOIN categories c ON c.id=a.category_id WHERE a.title LIKE '%מקווה%' OR a.title LIKE '%מקוה%' OR a.title LIKE '%תפילין%' ORDER BY a.id",
    categories: "SELECT id,name,slug FROM categories WHERE name LIKE '%שירות%'",
    columns: "SELECT table_name,column_name,is_identity,column_default FROM information_schema.columns WHERE table_schema='public' AND (table_name='articles' OR table_name LIKE 'article_%') ORDER BY table_name,ordinal_position"
  })) console.log(JSON.stringify({ [name]: (await pool.query(sql)).rows }));
} finally { await pool.end(); }
