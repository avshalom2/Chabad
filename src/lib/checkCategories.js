import { getPool } from './db.js';

async function checkCategories() {
  try {
    console.log('🔍 Checking for "Other" categories or articles with NULL category...\n');

    // Check for NULL categories
    const pool = await getPool();
    const [nullCatArticles] = await pool.query(
      `SELECT a.id, a.title, a.status, a.category_id, c.name as category_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.category_id IS NULL ORDER BY a.created_at DESC`
    );

    console.log('Articles with NULL category_id:');
    if (nullCatArticles.length === 0) {
      console.log('  None found');
    } else {
      nullCatArticles.forEach((art, i) => {
        console.log(`  ${i+1}. ID: ${art.id} | Title: ${art.title} | Status: ${art.status}`);
      });
    }

    // Check for category with "Other" in name
    const [otherCat] = await pool.query(
      `SELECT id, name, slug FROM categories WHERE name LIKE '%Other%' OR slug LIKE '%other%'`
    );

    console.log('\nCategories with "Other" in name:');
    if (otherCat.length === 0) {
      console.log('  None found');
    } else {
      otherCat.forEach(cat => {
        console.log(`  ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCategories();
