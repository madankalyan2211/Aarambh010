#!/bin/bash

# Render Deployment Script for Aarambh LMS Backend

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Render Deployment for Aarambh LMS Backend${NC}"

# Check if user is in the server directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the server directory${NC}"
    exit 1
fi

# Create render.yaml if it doesn't exist
if [ ! -f "render.yaml" ]; then
    echo -e "${YELLOW}Creating render.yaml configuration...${NC}"
    cat > render.yaml << EOF
services:
  - type: web
    name: aarambh-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3002
EOF
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}✅ Ready for Render deployment${NC}"
echo -e "${GREEN}To deploy to Render:${NC}"
echo -e "${GREEN}1. Go to https://dashboard.render.com${NC}"
echo -e "${GREEN}2. Click 'New' -> 'Web Service'${NC}"
echo -e "${GREEN}3. Connect your GitHub repository${NC}"
echo -e "${GREEN}4. Set the root directory to 'server'${NC}"
echo -e "${GREEN}5. Use the following environment variables:${NC}"
echo -e "${GREEN}   - NODE_ENV: production${NC}"
echo -e "${GREEN}   - PORT: 3002${NC}"
echo -e "${GREEN}   - MONGODB_URI: your_mongodb_connection_string${NC}"
echo -e "${GREEN}   - JWT_SECRET: your_jwt_secret${NC}"
echo -e "${GREEN}   - And other environment variables from .env.render${NC}"

echo -e "${GREEN}🎉 Render deployment preparation finished!${NC}"