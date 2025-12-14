const { Service } = require('node-windows');

// Create a new service object
const svc = new Service({
  name: 'Credit Flow Application',
  description: 'Credit Flow Management System - Production Service',
  script: require('path').join(__dirname, 'server', 'index.ts')
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
  console.log('✅ Credit Flow service uninstalled successfully!');
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err);
});

// Uninstall the service
console.log('Uninstalling Credit Flow Windows service...');
svc.uninstall();