import { getPool } from './db.js';

async function findArticles() {
  try {
    console.log('🔍 Finding articles with "כינוס" in the title...\n');

    const pool = await getPool();
    const [articles] = await pool.query(
      `SELECT a.id, a.title, a.status, c.name as category_name, c.id as category_id, c.slug 
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.title LIKE ?`,
      ['%כינוס%']
    );

    if (articles.length === 0) {
      console.log('No articles found with "כינוס"');
    } else {
      articles.forEach(art => {
        console.log(`Article ID: ${art.id}`);
        console.log(`  Title: ${art.title}`);
        console.log(`  Category: ${art.category_name || 'NULL'} (ID: ${art.category_id || 'NULL'})`);
        console.log(`  Status: ${art.status}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findArticles();
