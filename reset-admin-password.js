import { changePassword, getUserByEmail } from './src/lib/users.js';

async function resetAdminPassword() {
  try {
    const user = await getUserByEmail('admin@chabad.local');
    if (!user) {
      console.error('Admin user not found');
      process.exit(1);
    }

    console.log('🔄 Resetting admin password...');
    await changePassword(user.id, 'admin123');
    console.log('✅ Password reset successfully!');
    console.log('   Email: admin@chabad.local');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
