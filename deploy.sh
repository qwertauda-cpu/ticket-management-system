#!/bin/bash

# Script to deploy the ticket system to a remote server via SSH
# Usage: ./deploy.sh [user@host]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Ticket System Deployment Script ===${NC}\n"

# Check if SSH target is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide SSH target${NC}"
    echo "Usage: ./deploy.sh user@hostname"
    echo "Example: ./deploy.sh root@192.168.1.100"
    exit 1
fi

SSH_TARGET=$1
REMOTE_DIR="/var/www/ticket-system"

echo -e "${YELLOW}SSH Target: ${SSH_TARGET}${NC}"
echo -e "${YELLOW}Remote Directory: ${REMOTE_DIR}${NC}\n"

# Step 1: Build Frontend
echo -e "${GREEN}[1/6] Building Frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built successfully${NC}\n"

# Step 2: Build Backend
echo -e "${GREEN}[2/6] Building Backend...${NC}"
cd backend
npm run build
cd ..
echo -e "${GREEN}✓ Backend built successfully${NC}\n"

# Step 3: Create deployment package
echo -e "${GREEN}[3/6] Creating deployment package...${NC}"
mkdir -p deploy-temp

# Copy backend files
cp -r backend/dist deploy-temp/
cp -r backend/node_modules deploy-temp/
cp -r backend/prisma deploy-temp/
cp -r backend/generated deploy-temp/
cp backend/package.json deploy-temp/
cp backend/package-lock.json deploy-temp/

# Copy frontend build
cp -r frontend/dist deploy-temp/frontend-dist

# Copy deployment scripts
cat > deploy-temp/start.sh << 'EOF'
#!/bin/bash
export DATABASE_URL="file:./prisma/dev.db"
export JWT_SECRET="super-secret-jwt-key-production"
export PORT=3000
node dist/src/main.js
EOF

chmod +x deploy-temp/start.sh

cat > deploy-temp/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ticket-system-backend',
    script: './dist/src/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./prisma/dev.db',
      JWT_SECRET: 'super-secret-jwt-key-production',
      PORT: 3000
    }
  }]
};
EOF

# Create nginx config
cat > deploy-temp/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/ticket-system/frontend-dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Direct backend access (optional, for testing)
    location /backend/ {
        rewrite ^/backend/(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Create installation script for remote server
cat > deploy-temp/install.sh << 'EOF'
#!/bin/bash

echo "=== Installing Ticket System ==="

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Setup database
echo "Setting up database..."
cd /var/www/ticket-system
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Start backend with PM2
echo "Starting backend..."
pm2 delete ticket-system-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup Nginx if installed
if command -v nginx &> /dev/null; then
    echo "Configuring Nginx..."
    sudo cp nginx.conf /etc/nginx/sites-available/ticket-system
    sudo ln -sf /etc/nginx/sites-available/ticket-system /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

echo "=== Installation Complete ==="
echo "Backend running on: http://localhost:3000"
echo "Frontend accessible via: http://your-server-ip"
EOF

chmod +x deploy-temp/install.sh

echo -e "${GREEN}✓ Deployment package created${NC}\n"

# Step 4: Create tarball
echo -e "${GREEN}[4/6] Creating tarball...${NC}"
tar -czf ticket-system-deploy.tar.gz -C deploy-temp .
echo -e "${GREEN}✓ Tarball created: ticket-system-deploy.tar.gz${NC}\n"

# Step 5: Upload to server
echo -e "${GREEN}[5/6] Uploading to server...${NC}"
ssh $SSH_TARGET "mkdir -p $REMOTE_DIR"
scp ticket-system-deploy.tar.gz $SSH_TARGET:$REMOTE_DIR/
echo -e "${GREEN}✓ Files uploaded${NC}\n"

# Step 6: Extract and install on server
echo -e "${GREEN}[6/6] Installing on server...${NC}"
ssh $SSH_TARGET << ENDSSH
cd $REMOTE_DIR
tar -xzf ticket-system-deploy.tar.gz
rm ticket-system-deploy.tar.gz
bash install.sh
ENDSSH

echo -e "${GREEN}✓ Installation complete${NC}\n"

# Cleanup
rm -rf deploy-temp
rm ticket-system-deploy.tar.gz

echo -e "${GREEN}=== Deployment Successful! ===${NC}"
echo -e "${YELLOW}Backend API:${NC} http://your-server:3000"
echo -e "${YELLOW}Frontend:${NC} http://your-server"
echo -e "\n${YELLOW}Useful commands on server:${NC}"
echo "  pm2 status              - Check backend status"
echo "  pm2 logs                - View backend logs"
echo "  pm2 restart all         - Restart backend"
echo "  sudo systemctl status nginx - Check nginx status"

