import pool, { testDatabaseConnection } from './src/lib/db.js';

async function fixCreatedBy() {
  try {
    const connected = await testDatabaseConnection();
    if (!connected) {
      console.error('\n❌ Cannot proceed - database is not available');
      process.exit(1);
    }
    
    await pool.query('ALTER TABLE forms MODIFY COLUMN created_by VARCHAR(255)');
    console.log('✓ created_by column modified to VARCHAR(255)');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixCreatedBy();
