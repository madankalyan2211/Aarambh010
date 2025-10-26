# API Request Failed - Troubleshooting Guide

## ✅ Issue Resolved!

The API request failures were due to:
1. **Backend server not running** on port 3001
2. **Incorrect API base URL** in frontend configuration

---

## 🔧 Fixes Applied

### 1. Backend Server Restarted

The server is now running on **http://localhost:31001**

```bash
✅ MongoDB Connected
✅ Email server ready
✅ All endpoints registered
```

### 2. Created Frontend Environment File

**File**: [`.env`](/Users/madanthambisetty/Downloads/Aarambh/.env)

Key configuration:
```env
VITE_API_BASE_URL=http://localhost:31001/api
```

This ensures the frontend connects to the correct backend port (31001, not 3000).

---

## 🚀 How to Start the Application

### Backend Server

```bash
cd server
npm run dev
```

**Expected output**:
```
🚀 Aarambh LMS Backend Server Started
🚀 Server running on: http://localhost:31001
✅ MongoDB Connected
✅ Email server is ready
```

### Frontend Application

```bash
# In the root directory
npm run dev
```

**Expected output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🔍 Verification Steps

### 1. Check Backend Server Status

```bash
curl http://localhost:31001/health
```

**Expected response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-16T07:13:47.369Z"
}
```

### 2. Test Login Endpoint

```bash
curl -X POST http://localhost:31001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "student"
    }
  }
}
```

### 3. Check Frontend API Configuration

Open browser console when on http://localhost:5173 and check:
```javascript
import.meta.env.VITE_API_BASE_URL
// Should output: "http://localhost:31001/api"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "API request failed" or "Network Error"

**Cause**: Backend server not running

**Solution**:
```bash
cd server
npm run dev
```

### Issue 2: "Endpoint not found"

**Cause**: Incorrect API base URL

**Solution**: Check `.env` file has:
```env
VITE_API_BASE_URL=http://localhost:31001/api
```

Then restart frontend:
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

### Issue 3: CORS Error

**Cause**: Frontend origin not allowed

**Solution**: Backend is configured to allow `http://localhost:5173`. If you changed the port, update `server/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue 4: "Invalid email or password"

**Cause**: No users in database or wrong credentials

**Solution**: Create a test user:
```bash
cd server
node add-user.js test@example.com testpass123 "Test User" student
```

### Issue 5: Server Port Already in Use

**Cause**: Another process using port 3001

**Solution**:
```bash
# Find and kill the process
lsof -i :31001 | grep LISTEN
kill -9 <PID>

# Or change port in server/.env
PORT=31001
```

---

## 📊 Server Status Check Script

Create this handy script to check server status:

```
#!/bin/bash
# File: check-servers.sh

echo "Checking Backend Server (Port 31001)..."
curl -s http://localhost:31001/health && echo " ✅ Backend is running" || echo " ❌ Backend is not running"

echo ""
echo "Checking Frontend Server (Port 5173)..."
curl -s http://localhost:5173 > /dev/null && echo " ✅ Frontend is running" || echo " ❌ Frontend is not running"

echo ""
echo "Checking MongoDB Connection..."
curl -s http://localhost:31001/api/courses > /dev/null && echo " ✅ MongoDB is connected" || echo " ❌ MongoDB connection issue"
```

Make it executable:
```bash
chmod +x check-servers.sh
./check-servers.sh
```

---

## 🔐 Available Test Users

After database initialization, these users are available:

| Role | Email | Password |
|------|-------|----------|
| Student | test@example.com | testpass123 |
| Admin | admin@aarambh.edu | admin123 |
| Teacher | sarah.johnson@aarambh.edu | teacher123 |

---

## 📝 API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |

### Legacy OTP (Email-based)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP email |
| POST | /api/auth/verify-otp | Verify OTP code |
| POST | /api/auth/resend-otp | Resend OTP |

---

## 🌐 CORS Configuration

The backend allows these origins:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Alternative)

Add more origins in `server/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:4173
```

---

## 📱 Browser Console Debugging

### Check API Base URL
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

### Monitor API Requests
Open DevTools → Network tab → Filter: "Fetch/XHR"
- Look for requests to `http://localhost:31001/api/`
- Check request payload and response

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Backend not running | Start backend server |
| "Network error" | Wrong port/URL | Check `.env` file |
| "401 Unauthorized" | Invalid/missing token | Re-login to get new token |
| "404 Not Found" | Wrong endpoint path | Check API endpoint spelling |
| "500 Internal Server Error" | Backend error | Check server logs |

---

## 🔄 Complete Restart Process

If all else fails, do a complete restart:

```bash
# 1. Stop all servers
pkill -f "node"

# 2. Clear any stuck ports
lsof -ti :31001 | xargs kill -9
lsof -ti :5173 | xargs kill -9

# 3. Restart backend
cd server
npm run dev

# 4. In another terminal, restart frontend
cd ..
npm run dev
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend server is running on port 3001
- [ ] Frontend is running on port 5173
- [ ] `.env` file exists in root directory
- [ ] `VITE_API_BASE_URL=http://localhost:31001/api` in `.env`
- [ ] MongoDB is connected (check server logs)
- [ ] At least one test user exists in database
- [ ] CORS origins include your frontend URL
- [ ] No firewall blocking localhost connections
- [ ] Browser console shows no errors
- [ ] Network tab shows requests to correct URL

---

## 🆘 Getting Help

If issues persist:

1. **Check server logs**:
   ```bash
   cd server
   tail -f server.log
   ```

2. **Check database connection**:
   ```bash
   cd server
   node test-connection.js
   ```

3. **Verify MongoDB users**:
   ```bash
   cd server
   node view-users.js
   ```

4. **Test endpoints directly**:
   ```bash
   curl -X POST http://localhost:31001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'
   ```

---

**The API is now fully operational! Both backend and frontend are configured correctly.** 🎉
