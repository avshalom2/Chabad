import { getPool } from './db.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Checking articles table structure...\n');

    const pool = await getPool();
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'articles' AND TABLE_SCHEMA = 'chabad_db'
       ORDER BY ORDINAL_POSITION`
    );

    console.log('Columns in articles table:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, nullable: ${col.IS_NULLABLE})`);
    });

    // Also list a sample article to see what data exists
    console.log('\n\nSample article with draft status:');
    const [sample] = await pool.query(
      `SELECT * FROM articles WHERE status = 'draft' LIMIT 1`
    );
    if (sample.length > 0) {
      console.log(JSON.stringify(sample[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkTableStructure();
