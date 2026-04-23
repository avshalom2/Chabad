import { getPool } from './db.js';
import { createUser } from './users.js';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    await getPool();

    await createUser({
      username: 'admin',
      email: 'admin@chabad.local',
      password: 'admin123',
      display_name: 'Admin User',
      access_level_id: 1,
    });

    console.log('Admin user created:');
    console.log('  Email: admin@chabad.local');
    console.log('  Password: admin123');
    console.log('  Please change this password after first login.');
    console.log('Database seeded successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedDatabase();
