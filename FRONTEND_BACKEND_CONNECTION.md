# Frontend-Backend Connection Guide

This guide explains how to properly connect the Aarambh LMS frontend with the backend.

## Current Configuration

### Frontend Environment Variables
The frontend connects to the backend using the `VITE_API_BASE_URL` environment variable.

**Local Development**:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**Production**:
```env
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
```

### Backend Configuration
The backend runs on port 3001 by default and serves API endpoints under the `/api` path.

## How the Connection Works

### 1. API Service
The frontend uses the [src/services/api.service.ts](src/services/api.service.ts) file to communicate with the backend:

```typescript
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

### 2. API Requests
All API requests are made using the `apiRequest` function:

```typescript
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    // ... handle response
  } catch (error) {
    // ... handle error
  }
};
```

## Running the Application Locally

### 1. Start the Backend
```bash
cd server
npm start
```

Expected output:
```
🚀 Aarambh LMS Backend Server Started
🚀 Environment: development
🚀 Server running on port: 3001
```

### 2. Start the Frontend
In a new terminal:
```bash
npm run dev
```

Expected output:
```
VITE v5.4.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Test the Connection
Visit http://localhost:5173 in your browser and try to:
1. Register a new user
2. Login with the registered user
3. Navigate to different pages

## Troubleshooting Connection Issues

### 1. CORS Errors
If you see CORS errors in the browser console:

**Solution**: Check the `ALLOWED_ORIGINS` environment variable in the backend [.env](server/.env) file:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. "Network Error" or "Failed to Fetch"
If the frontend cannot reach the backend:

**Check**:
1. Backend server is running (`cd server && npm start`)
2. Backend is running on the correct port (3001)
3. No firewall blocking the connection
4. Environment variables are correctly set

**Solution**:
```bash
# Test backend directly
curl http://localhost:3001/health

# Should return:
# {"success":true,"message":"Server is running",...}
```

### 3. API Endpoints Not Found (404)
If you get 404 errors for API endpoints:

**Check**:
1. API endpoint paths are correct
2. Backend routes are properly defined
3. Environment variable `VITE_API_BASE_URL` is correct

### 4. Authentication Issues
If authentication is not working:

**Check**:
1. MongoDB connection is working
2. User credentials are correct
3. JWT secrets match between frontend and backend

## Production Deployment

### For Render (Backend) + Vercel (Frontend)

1. **Set Backend Environment Variables in Render**:
   ```env
   VITE_API_BASE_URL=https://your-render-app.onrender.com/api
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```

2. **Set Frontend Environment Variables in Vercel**:
   ```env
   VITE_API_BASE_URL=https://your-render-app.onrender.com/api
   ```

## Testing the Connection

### 1. Health Check
```bash
# Backend health check
curl http://localhost:3001/health
```

### 2. API Endpoints
```bash
# Test authentication endpoints
curl http://localhost:3001/api/auth/me
```

### 3. Frontend Development Server
Visit http://localhost:5173 and open browser developer tools to check for any connection errors.

## Common Environment Variables

### Frontend (.env file)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Backend (server/.env file)
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Useful Commands

```bash
# Start backend
cd server && npm start

# Start frontend
npm run dev

# Test backend connection
curl http://localhost:3001/health

# Test API endpoint
curl http://localhost:3001/api/auth/me

# Check environment variables
echo $VITE_API_BASE_URL
```

## Security Considerations

1. **Never commit sensitive information** to version control
2. **Use different secrets** for development and production
3. **Validate all API responses** in the frontend
4. **Implement proper error handling** for network requests
5. **Use HTTPS** in production

## Next Steps

1. Start both servers (backend and frontend)
2. Visit http://localhost:5173
3. Register a new user
4. Login and explore the application
5. Check browser developer tools for any errors

If you encounter any issues, refer to the troubleshooting section above.