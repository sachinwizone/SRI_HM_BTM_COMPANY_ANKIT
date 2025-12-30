import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  try {
    console.log('Checking database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const result = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (result.length > 0) {
      const admin = result[0];
      console.log('\nAdmin user found:');
      console.log('- ID:', admin.id);
      console.log('- Username:', admin.username);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Active:', admin.isActive);
      console.log('- Has password:', admin.password ? 'Yes' : 'No');
    } else {
      console.log('\n❌ Admin user NOT found in database!');
    }
    
    // Check total users
    const allUsers = await db.select().from(users);
    console.log('\nTotal users in database:', allUsers.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error.message);
    process.exit(1);
  }
}

checkAdmin();
