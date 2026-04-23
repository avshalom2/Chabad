import pool, { testDatabaseConnection } from './db.js';
import { createUser } from './users.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Test connection first
    const connected = await testDatabaseConnection();
    if (!connected) {
      console.error('\n❌ Cannot proceed with seeding - database is not available');
      process.exit(1);
    }

    // Create first admin user
    const adminId = await createUser({
      username: 'admin',
      email: 'admin@chabad.local',
      password: 'admin123',  // Change this after first login!
      display_name: 'Admin User',
      access_level_id: 1,  // admin level
    });

    console.log('✅ Admin user created:');
    console.log(`   Email: admin@chabad.local`);
    console.log(`   Password: admin123`);
    console.log(`   Please change this password after first login!`);
    console.log(`\n🎉 Database seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedDatabase();
