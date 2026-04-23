import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});

(async () => {
  const conn = await pool.getConnection();
  
  // Check if sessions table exists
  const [tables] = await conn.query(`SHOW TABLES LIKE 'sessions'`);
  console.log('Sessions table exists:', tables.length > 0);

  // Check if users table exists and has admin user
  const [users] = await conn.query(`SELECT id, email, is_active FROM users WHERE email = 'admin@chabad.local'`);
  console.log('Admin user found:', users.length > 0, users[0] || '');

  // Check access_levels table
  const [levels] = await conn.query(`SELECT * FROM access_levels LIMIT 5`);
  console.log('Access levels:', levels);

  conn.release();
  await pool.end();
})();
