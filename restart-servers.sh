#!/bin/bash

# Script to restart both frontend and backend servers

echo "🔄 Restarting Aarambh LMS servers..."

# Kill any existing processes on the required ports
echo "🛑 Killing existing processes..."
lsof -ti:5173,5174,31001 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd /Users/madanthambisetty/Downloads/Aarambh/server
npm start &

# Wait for backend to start
sleep 5

# Start frontend server
echo "🎨 Starting frontend server..."
cd /Users/madanthambisetty/Downloads/Aarambh
npm run dev &

echo "✅ Servers restart initiated!"
echo "📝 Check the terminals for detailed output"
echo "🌐 Frontend will be available at http://localhost:5174 (or similar)"
echo "🔧 Backend API will be available at http://localhost:31001"