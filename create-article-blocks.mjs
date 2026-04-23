import pool, { testDatabaseConnection } from './src/lib/db.js';

async function createArticleBlocksTable() {
  try {
    const connected = await testDatabaseConnection();
    if (!connected) {
      console.error('\n❌ Cannot proceed - database is not available');
      process.exit(1);
    }
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_blocks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        article_id INT UNSIGNED NOT NULL,
        block_type ENUM('text','two_column','image','form','qna','divider') NOT NULL,
        data LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ article_blocks table created');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createArticleBlocksTable();
