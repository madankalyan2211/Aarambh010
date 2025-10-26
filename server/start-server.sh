#!/bin/bash

# Production startup script for Aarambh backend

echo "Starting Aarambh LMS Backend Server..."

# Check if we're on Render (environment variables will be set)
if [ -n "$RENDER" ]; then
  echo "Running on Render environment"
  echo "Port provided by Render: $PORT"
  echo "Node environment: $NODE_ENV"
else
  echo "Running in local development environment"
fi

# Start the server
node server.js