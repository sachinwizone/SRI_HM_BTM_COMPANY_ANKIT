const { Service } = require('node-windows');

// Create a new service object
const svc = new Service({
  name: 'Credit Flow Application',
  description: 'Credit Flow Management System - Production Service',
  script: require('path').join(__dirname, 'server', 'index.ts'),
  nodeOptions: [
    '--loader=tsx'
  ],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    },
    {
      name: 'PORT', 
      value: '3000'
    },
    {
      name: 'DATABASE_URL',
      value: 'postgresql://postgres:ss123456@103.122.85.61:9095/postgres'
    }
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('✅ Credit Flow service installed successfully!');
  console.log('Starting the service...');
  svc.start();
});

svc.on('start', function() {
  console.log('✅ Credit Flow service started successfully!');
  console.log('🚀 Application is now running permanently on port 3000');
  console.log('📊 Access your application at: http://localhost:3000');
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err);
});

// Install the service
console.log('Installing Credit Flow as a Windows service...');
svc.install();