module.exports = {
  apps: [{
    name: 'pocket-bounty',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://pocket_user:MySecurePassword123@localhost:5432/pocket_bounty',
      PGUSER: 'pocket_user',
      PGPASSWORD: 'MySecurePassword123',
      PGDATABASE: 'pocket_bounty',
      PGHOST: 'localhost',
      PGPORT: '5432',
      SESSION_SECRET: 'abc123xyz789verylongrandomstringhere64characterslongplease'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};