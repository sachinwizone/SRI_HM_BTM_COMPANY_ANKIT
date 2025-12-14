module.exports = {
  apps: [
    {
      name: 'credit-flow-app',
      script: './server/index.ts',
      interpreter: 'tsx',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://postgres:ss123456@103.122.85.61:9095/postgres'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        DATABASE_URL: 'postgresql://postgres:ss123456@103.122.85.61:9095/postgres'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};