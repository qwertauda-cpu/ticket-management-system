const fs = require('fs');
const path = require('path');

// قراءة .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          env[key.trim()] = values.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
  }
  
  return env;
}

const envVars = loadEnv();

module.exports = {
  apps: [
    {
      name: 'ticket-backend',
      script: './dist/src/main.js',
      cwd: '/home/qwertauda/ticket-management-system/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: envVars.PORT || '3001',
        DATABASE_URL: envVars.DATABASE_URL || 'file:./prisma/dev.db',
        JWT_SECRET: envVars.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-12345',
      },
      error_file: '/home/qwertauda/.pm2/logs/ticket-backend-error.log',
      out_file: '/home/qwertauda/.pm2/logs/ticket-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

