// Script to create the first admin user
import { AuthService } from './auth';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminUser = await AuthService.createUser({
      username: 'admin',
      password: 'admin123', // Change this password after first login
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@company.com',
      role: 'ADMIN'
    });

    console.log('Admin user created successfully:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Admin user already exists!');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
  process.exit(0);
}

createAdminUser();