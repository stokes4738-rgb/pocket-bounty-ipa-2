# Self-Hosting Pocket Bounty on Your PC

This guide will help you run Pocket Bounty on your own PC/server and remove all Replit dependencies.

## Prerequisites

### Required Software
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2
```

### For Windows
```powershell
# Install using Chocolatey
choco install nodejs postgresql

# Or download installers:
# Node.js: https://nodejs.org/download/
# PostgreSQL: https://www.postgresql.org/download/windows/
```

## Database Setup

### 1. Create PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE pocket_bounty;
CREATE USER pocket_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pocket_bounty TO pocket_user;
\q
```

### 2. Get Database Connection String
```bash
# Your DATABASE_URL will be:
postgresql://pocket_user:your_secure_password@localhost:5432/pocket_bounty
```

## Environment Configuration

### 1. Create Production Environment File
Create `.env.production`:
```env
# Database
DATABASE_URL=postgresql://pocket_user:your_secure_password@localhost:5432/pocket_bounty

# Server
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_long_random_session_secret_here

# Database connection details
PGUSER=pocket_user
PGPASSWORD=your_secure_password
PGDATABASE=pocket_bounty
PGHOST=localhost
PGPORT=5432

# Optional: Stripe (if using payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 2. Generate Secure Session Secret
```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Application Setup

### 1. Clone/Download Your Project
```bash
# If using git
git clone your_repository_url pocket-bounty
cd pocket-bounty

# Or download and extract the files to a folder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schema
```bash
# Push your schema to the new database
npm run db:push
```

### 4. Build for Production
```bash
npm run build
```

## Running the Application

### Option 1: Using PM2 (Recommended)
```bash
# Create PM2 ecosystem file
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pocket-bounty',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Make PM2 start on system boot
pm2 startup
pm2 save
```

### Option 2: Direct Node
```bash
# Set environment and start
NODE_ENV=production node dist/index.js
```

### Option 3: Using systemd (Linux)
Create `/etc/systemd/system/pocket-bounty.service`:
```ini
[Unit]
Description=Pocket Bounty App
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/pocket-bounty
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable pocket-bounty
sudo systemctl start pocket-bounty
```

## Network Configuration

### 1. Local Access
Your app will be available at: `http://localhost:5000`

### 2. Network Access (LAN)
```bash
# Find your PC's IP address
ip addr show  # Linux
ipconfig      # Windows

# Access from other devices: http://YOUR_PC_IP:5000
```

### 3. Internet Access (Port Forwarding)
1. **Router Configuration**: Forward port 5000 to your PC
2. **Firewall**: Allow port 5000
3. **Dynamic DNS** (optional): Use service like DuckDNS for domain name

### 4. Reverse Proxy with Nginx (Recommended)
```nginx
# /etc/nginx/sites-available/pocket-bounty
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Certificate (HTTPS)

### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Monitoring & Maintenance

### 1. Check Application Status
```bash
# With PM2
pm2 status
pm2 logs pocket-bounty

# With systemd
sudo systemctl status pocket-bounty
sudo journalctl -u pocket-bounty -f
```

### 2. Database Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U pocket_user pocket_bounty > backup_$DATE.sql
```

### 3. Application Updates
```bash
# Stop app
pm2 stop pocket-bounty

# Update code
git pull  # or replace files

# Rebuild
npm run build

# Update database if needed
npm run db:push

# Restart
pm2 start pocket-bounty
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong session secret
- [ ] Configure firewall
- [ ] Enable SSL/HTTPS
- [ ] Regular backups
- [ ] Keep Node.js updated
- [ ] Monitor logs

## Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U pocket_user -d pocket_bounty

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### Port Already in Use
```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill process if needed
sudo kill -9 PID
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R your_username:your_username /path/to/pocket-bounty
```

Your Pocket Bounty app is now completely self-hosted and independent of Replit!