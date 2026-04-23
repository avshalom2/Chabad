import { getPool } from './db.js';

async function deleteOtherCategory() {
  try {
    console.log('🗑️ Deleting "Other" category and its articles...');

    // First, find the category ID for "Other"
    const pool = await getPool();
    const [categories] = await pool.query(
      'SELECT id FROM categories WHERE slug = ?',
      ['other']
    );

    if (categories.length === 0) {
      console.log('❌ Category "Other" not found');
      process.exit(1);
    }

    const categoryId = categories[0].id;
    console.log(`Found category ID: ${categoryId}`);

    // Delete all articles in this category
    const [deleteArticlesResult] = await pool.query(
      'DELETE FROM articles WHERE category_id = ?',
      [categoryId]
    );
    console.log(`✅ Deleted ${deleteArticlesResult.affectedRows} articles`);

    // Delete the category
    const [deleteCategoryResult] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [categoryId]
    );
    console.log(`✅ Deleted category "Other"`);

    console.log('\n🎉 Category and articles removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteOtherCategory();
