#!/bin/bash

# Quick deployment script - Simple version
# Usage: ./quick-deploy.sh user@host

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./quick-deploy.sh user@host${NC}"
    echo "Example: ./quick-deploy.sh root@192.168.1.100"
    exit 1
fi

SSH_TARGET=$1

echo -e "${GREEN}=== Quick Deployment ===${NC}\n"

# Build everything
echo -e "${YELLOW}Building...${NC}"
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# Create package
echo -e "${YELLOW}Packaging...${NC}"
tar -czf deploy.tar.gz \
    backend/dist \
    backend/node_modules \
    backend/prisma \
    backend/generated \
    backend/package.json \
    frontend/dist

# Upload
echo -e "${YELLOW}Uploading...${NC}"
scp deploy.tar.gz $SSH_TARGET:~/

# Install
echo -e "${YELLOW}Installing on server...${NC}"
ssh $SSH_TARGET << 'ENDSSH'
cd ~
tar -xzf deploy.tar.gz
rm deploy.tar.gz

# Setup backend
cd ~/backend
export DATABASE_URL="file:./prisma/dev.db"
export JWT_SECRET="super-secret-key-123"
export PORT=3000

# Generate prisma
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Start with nohup (simple way)
pkill -f "node dist/src/main.js" 2>/dev/null || true
nohup node dist/src/main.js > backend.log 2>&1 &

echo "Backend started on port 3000"
echo "Check logs: tail -f ~/backend/backend.log"
ENDSSH

# Cleanup
rm deploy.tar.gz

echo -e "${GREEN}Done!${NC}"
echo -e "Backend API: http://your-server:3000"
echo -e "Frontend files: ~/frontend/dist"

