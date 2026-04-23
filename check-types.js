import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});

(async () => {
  const conn = await pool.getConnection();
  const [types] = await conn.query('SELECT id, name, slug FROM category_types');
  console.log('Category types:');
  types.forEach(t => console.log(`  id=${t.id} name="${t.name}" slug="${t.slug}"`));

  const [cats] = await conn.query(
    `SELECT c.id, c.name, c.slug, ct.name AS type_name, ct.slug AS type_slug
     FROM categories c JOIN category_types ct ON ct.id = c.category_type_id
     WHERE c.name IN ('יודייקה','תפילים ומזוזות','ספרים','חנות חב"ד')`
  );
  console.log('\nShop categories:');
  cats.forEach(c => console.log(`  "${c.name}" type_slug="${c.type_slug}"`));

  conn.release();
  await pool.end();
})();
