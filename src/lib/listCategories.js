import { getPool } from './db.js';

async function listCategories() {
  try {
    console.log('📋 Listing all categories...\n');

    const pool = await getPool();
    const [categories] = await pool.query(
      'SELECT id, name, slug FROM categories'
    );

    if (categories.length === 0) {
      console.log('No categories found');
    } else {
      categories.forEach(cat => {
        console.log(`ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listCategories();
