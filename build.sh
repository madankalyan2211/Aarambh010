#!/bin/bash

# Build script for Vercel deployment

echo "Starting frontend build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
  echo "Failed to install dependencies"
  exit 1
fi

# Build the application
echo "Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Failed to build the application"
  exit 1
fi

echo "Frontend build completed successfully!"