import { getPool } from './db.js';

async function deleteOtherArticles() {
  try {
    console.log('🗑️ Deleting all articles in "Other" group...\n');

    // Find all articles whose category has no parent (parent_id IS NULL)
    const pool = await getPool();
    const [articles] = await pool.query(
      `SELECT a.id, a.title, a.status, c.name as category_name
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       WHERE c.parent_id IS NULL
       ORDER BY a.created_at DESC`
    );

    console.log(`Found ${articles.length} articles in "Other" group:\n`);
    articles.forEach(art => {
      console.log(`  ID: ${art.id} | Title: ${art.title} | Category: ${art.category_name} | Status: ${art.status}`);
    });

    if (articles.length === 0) {
      console.log('No articles to delete.');
      process.exit(0);
    }

    // Delete all these articles
    const articleIds = articles.map(art => art.id);
    const [result] = await pool.query(
      `DELETE FROM articles WHERE id IN (${articleIds.map(() => '?').join(',')})`,
      articleIds
    );

    console.log(`\n✅ Deleted ${result.affectedRows} articles`);
    console.log('\n🎉 "Other" group removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteOtherArticles();
