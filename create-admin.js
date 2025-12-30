import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    console.log('Creating admin user...\n');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const [admin] = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    }).returning();
    
    console.log('✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nUser details:');
    console.log('- ID:', admin.id);
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === '23505') {
      console.log('\nAdmin user already exists!');
    }
    process.exit(1);
  }
}

createAdminUser();
