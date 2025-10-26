#!/bin/bash

# Aarambh LMS - Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting Aarambh LMS..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend server is already running
if lsof -Pi :31001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend server is already running on port 31001${NC}"
else
    echo -e "${GREEN}Starting backend server...${NC}"
    cd server && npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    sleep 3
fi

# Check if frontend server is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend server is already running on port 5173${NC}"
else
    echo -e "${GREEN}Starting frontend server...${NC}"
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    sleep 3
fi

echo ""
echo "═════════════════════════════════════════"
echo -e "${GREEN}✅ Aarambh LMS is starting!${NC}"
echo "═════════════════════════════════════════"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:31001"
echo "💚 Health:   http://localhost:31001/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   pkill -f 'node.*server.js'"
echo "   pkill -f 'vite'"
echo ""

# Wait a bit and check if servers are running
sleep 2

echo "Checking server status..."
echo ""

# Check backend
if curl -s http://localhost:31001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    echo "   Check: tail -f backend.log"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    echo "   Check: tail -f frontend.log"
fi

echo ""
echo "🎉 Ready! Open http://localhost:5173 in your browser"
echo ""
