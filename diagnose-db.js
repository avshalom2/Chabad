#!/usr/bin/env node
/**
 * Database Diagnostic Tool
 * Checks MySQL connection and provides troubleshooting guidance
 */

import { testDatabaseConnection } from './src/lib/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function diagnoseDatabase() {
  console.log('🔍 Database Diagnostic Tool\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   DB_HOST: ${process.env.DB_HOST || '❌ NOT SET'}`);
  console.log(`   DB_PORT: ${process.env.DB_PORT || '3306 (default)'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || '❌ NOT SET'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '❌ NOT SET'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || '❌ NOT SET'}`);
  
  // Test connection
  console.log('\n🧪 Testing Connection...');
  const connected = await testDatabaseConnection();
  
  if (connected) {
    console.log('\n✅ Database is ready for operations!');
    console.log('\nYou can now run:');
    console.log('   node setup-templates.js');
    console.log('   node src/lib/seed.js');
    console.log('   node seed-chabad-data.js');
  } else {
    console.log('\n❌ Database connection failed\n');
    
    console.log('🛠️  Troubleshooting Steps:\n');
    
    if (process.env.DB_HOST === 'db' || process.env.DB_HOST === 'mysql') {
      console.log('1️⃣  Start Docker Compose:');
      console.log('    docker-compose up -d\n');
    } else if (!process.env.DB_HOST) {
      console.log('1️⃣  Check .env.local file exists');
      console.log('    Should contain: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME\n');
    }
    
    console.log('2️⃣  Verify MySQL is running:');
    console.log(`    mysql -h ${process.env.DB_HOST || 'localhost'} -u ${process.env.DB_USER || 'root'} -p\n`);
    
    console.log('3️⃣  Check Docker containers:');
    console.log('    docker ps\n');
    
    console.log('4️⃣  View Docker logs:');
    console.log('    docker-compose logs db\n');
  }
  
  process.exit(connected ? 0 : 1);
}

diagnoseDatabase();
