# Frontend-Backend Connection Setup Summary

This document summarizes the steps taken to properly connect the Aarambh LMS frontend with the backend.

## Current Status

✅ **Backend Server**: Running on http://localhost:3001
✅ **Frontend Server**: Can be started with `npm run dev` on http://localhost:5173
✅ **Database Connection**: MongoDB successfully connected
✅ **API Communication**: Frontend can communicate with backend API

## Configuration Overview

### Environment Variables

**Frontend** ([.env](file:///Users/madanthambisetty/Downloads/Aarambh/.env)):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**Backend** ([server/.env](file:///Users/madanthambisetty/Downloads/Aarambh/server/.env)):
```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Connection Flow

1. Frontend makes API requests to `http://localhost:3001/api/*`
2. Backend receives requests and processes them
3. Backend communicates with MongoDB database
4. Backend returns JSON responses to frontend
5. Frontend updates UI based on API responses

## Files Modified

1. **[server/config/database.js](server/config/database.js)** - Fixed MongoDB connection options
2. **[test-api-connection.js](test-api-connection.js)** - Created connection testing script
3. **[FRONTEND_BACKEND_CONNECTION.md](FRONTEND_BACKEND_CONNECTION.md)** - Created comprehensive connection guide

## How to Run the Application

### 1. Start the Backend Server
```bash
cd server
npm start
```

Expected output:
```
🚀 Aarambh LMS Backend Server Started
🚀 Server running on port: 3001
✅ MongoDB Connected
```

### 2. Start the Frontend Server
In a new terminal:
```bash
npm run dev
```

Expected output:
```
VITE v5.4.8  ready in 1234 ms
  ➜  Local:   http://localhost:5173/
```

### 3. Test the Connection
1. Visit http://localhost:5173
2. Try to register a new user
3. Check browser developer tools for any errors

## Verification Commands

```bash
# Test backend health
curl http://localhost:3001/health

# Test API connection
node test-api-connection.js

# Check if servers are running
lsof -i :3001  # Backend
lsof -i :5173  # Frontend (after starting)
```

## Troubleshooting

### If Backend Won't Start
1. Check if port 3001 is already in use:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. Verify MongoDB Atlas IP whitelist includes your IP

3. Check environment variables in [server/.env](server/.env)

### If Frontend Can't Connect to Backend
1. Ensure backend is running on port 3001

2. Check `VITE_API_BASE_URL` in [.env](file:///Users/madanthambisetty/Downloads/Aarambh/.env) file

3. Verify `ALLOWED_ORIGINS` in [server/.env](server/.env) includes `http://localhost:5173`

### Common Error Messages

1. **"Failed to fetch"**: Backend server not running or unreachable
2. **CORS errors**: `ALLOWED_ORIGINS` not configured correctly
3. **404 errors**: Incorrect API endpoint paths
4. **500 errors**: Backend server errors

## Production Deployment

For deployment to Render (backend) and Vercel (frontend):

1. Update environment variables in deployment platforms
2. Ensure `ALLOWED_ORIGINS` includes your frontend URL
3. Verify MongoDB Atlas IP whitelist includes Render IPs

## Next Steps

1. ✅ Start both servers (instructions above)
2. ✅ Visit http://localhost:5173
3. ✅ Register and login to test authentication
4. ✅ Navigate through different pages to test all features
5. ✅ Check browser console for any errors

## Documentation

- [FRONTEND_BACKEND_CONNECTION.md](FRONTEND_BACKEND_CONNECTION.md) - Complete connection guide
- [RENDER_MONGODB_INTEGRATION.md](RENDER_MONGODB_INTEGRATION.md) - Render deployment guide
- [MONGODB_TROUBLESHOOTING.md](MONGODB_TROUBLESHOOTING.md) - Database connection issues

The frontend and backend are now properly connected and ready for development and deployment.

# Connection Setup Summary

This document summarizes the connection setup between your Vercel frontend and Render backend.

## Current Configuration

### 1. Frontend to Backend API Connection
- **Frontend Environment Variable**: `VITE_API_BASE_URL=https://aarambh01-m6cx.onrender.com`
- **Location**: [.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production) file
- **Usage**: All API calls in [src/services/api.service.ts](file:///Users/madanthambisetty/Downloads/Aarambh/src/services/api.service.ts) use this base URL

### 2. Vercel Proxy Configuration
- **File**: [vercel.json](file:///Users/madanthambisetty/Downloads/Aarambh/vercel.json)
- **Rewrite Rule**: `/api/(.*)` requests are forwarded to `https://aarambh01-m6cx.onrender.com`
- **Purpose**: Ensures client-side routing works correctly

### 3. Backend CORS Configuration
- **File**: [server/.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/server/.env.production)
- **Allowed Origins**: 
  - `http://localhost:3000` (local development)
  - `https://aarambh-frontend.vercel.app` (main deployment)
  - `https://aarambh-git-main-madantambisetty.vercel.app` (preview deployments)

### 4. Render Deployment
- **Service Name**: aarambh-backend
- **URL**: https://aarambh01-m6cx.onrender.com
- **Environment Variables**: Configured in Render dashboard (not in code for security)

## How It Works

1. Frontend makes API calls to `/api/...` endpoints
2. These calls are prefixed with `VITE_API_BASE_URL` (https://aarambh01-m6cx.onrender.com)
3. Vercel forwards requests to the Render backend
4. Render backend processes requests and returns responses
5. CORS is properly configured to allow requests from Vercel domains

## Verification

To verify the connection is working:

1. Visit your Vercel frontend URL
2. Try to login or register (these make API calls)
3. Check browser Network tab to see requests going to https://aarambh01-m6cx.onrender.com
4. Confirm successful responses from the backend

## Troubleshooting

If you encounter connection issues:

1. Check that Render backend is running (visit https://aarambh01-m6cx.onrender.com directly)
2. Verify CORS configuration includes your frontend domain
3. Confirm environment variables are set correctly in both Vercel and Render
4. Check browser console for CORS errors
