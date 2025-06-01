
module.exports = {
  apps: [
    {
      name: 'finplanner',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './app',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/finplanner.git',
      path: '/var/www/finplanner',
      'pre-deploy-local': '',
      'post-deploy': 'cd app && npm ci && npx prisma migrate deploy && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install nodejs npm postgresql'
    },
    staging: {
      user: 'ubuntu',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'https://github.com/yourusername/finplanner.git',
      path: '/var/www/finplanner-staging',
      'post-deploy': 'cd app && npm ci && npx prisma migrate deploy && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
