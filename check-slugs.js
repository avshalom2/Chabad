import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  const conn = await pool.getConnection();
  const [cats] = await conn.query(
    'SELECT id, name, slug FROM categories WHERE name IN ("ספרים", "יודייקה", "תפילים ומזוזות")'
  );
  console.log('Category slugs:');
  cats.forEach(cat => {
    console.log(`${cat.name}: ${cat.slug}`);
  });
  await conn.end();
  await pool.end();
})();
