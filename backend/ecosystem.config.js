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
        PORT: 3001,
      },
      env_file: '.env',
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

