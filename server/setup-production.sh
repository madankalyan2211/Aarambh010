#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update the .env file with your configuration"
    exit 1
fi

# Install dependencies
echo "Installing production dependencies..."
npm install --production

# Set proper permissions
echo "Setting up permissions..."
chmod 600 .env
chmod +x server.js

# Create logs directory if it doesn't exist
mkdir -p logs

# Set NODE_ENV to production
export NODE_ENV=production

echo "Production setup complete!"
echo "1. Edit the .env file with your configuration"
echo "2. Start the server with: npm start"
echo "3. For production monitoring, consider using PM2: npm install -g pm2 && pm2 start server.js"
