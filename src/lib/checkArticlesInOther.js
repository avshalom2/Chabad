import { getPool } from './db.js';

async function checkArticlesInOther() {
  try {
    console.log('🔍 Checking articles with NULL parent_category_name (Other group)...\n');

    const pool = await getPool();
    const [articles] = await pool.query(
      `SELECT a.id, a.title, a.status, a.parent_category_name, a.category_name
       FROM articles a
       WHERE a.parent_category_name IS NULL
       ORDER BY a.created_at DESC`
    );

    console.log(`Found ${articles.length} articles in "Other" group:\n`);
    articles.forEach(art => {
      console.log(`  ID: ${art.id} | Title: ${art.title} | Status: ${art.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkArticlesInOther();
