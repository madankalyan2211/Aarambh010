#!/bin/bash

# Build script for Render deployment

echo "Starting build process for Aarambh LMS..."

# Check if we're on Render
if [ -n "$RENDER" ]; then
  echo "Building on Render environment"
else
  echo "Building in local environment"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "Ready to start server with 'npm start'"