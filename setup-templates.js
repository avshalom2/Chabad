import pool, { testDatabaseConnection } from './src/lib/db.js';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');
    
    // Test connection first
    const connected = await testDatabaseConnection();
    if (!connected) {
      console.error('\n❌ Cannot proceed with setup - database is not available');
      process.exit(1);
    }
    
    // Create hp_templates table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS hp_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_name VARCHAR(255) NOT NULL,
        template_html LONGTEXT NOT NULL,
        homepage_html LONGTEXT,
        is_active BOOLEAN DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_hp_templates_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_hp_templates_active (is_active)
      )
    `;

    const result = await pool.query(createTableSQL);
    console.log('✓ hp_templates table created successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
