import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Client } = pkg;

async function testConnection() {
  console.log('Testing database connection...\n');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
  console.log('');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Database connection successful!\n');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPossible causes:');
    console.error('1. Database server is not running');
    console.error('2. Wrong host/port in DATABASE_URL');
    console.error('3. Wrong username/password');
    console.error('4. Firewall blocking connection');
    console.error('5. Database server not accessible from your network');
    
    process.exit(1);
  }
}

testConnection();
