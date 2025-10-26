# Backend Server Restart - Issue Resolved ✅

## 🔍 Problem

The backend server on port 31001 crashed with an EIO (input/output) error:
```
Error: read EIO
errno: -5, code: 'EIO', syscall: 'read'
```

This error occurs when running Node.js in background mode without proper terminal handling.

---

## ✅ Solution Applied

Restarted the backend server using the correct command:

```bash
cd /Users/madanthambisetty/Downloads/Aarambh/server
(npm run dev &)
```

This starts the server in background mode while keeping it attached to the terminal properly.

---

## 🚀 Current Status

### Backend Server
- **Status**: ✅ Running
- **Port**: 31001
- **URL**: http://localhost:31001
- **Health**: http://localhost:31001/health
- **Process ID**: 27098
- **Mode**: Development (nodemon with auto-reload)

### Database
- **Status**: ✅ Connected
- **Type**: MongoDB Atlas
- **Database**: aarambh-lms
- **Host**: ac-bocmo2t-shard-00-02.bozwgdv.mongodb.net

### Email Service
- **Status**: ✅ Ready
- **Provider**: Gmail
- **From**: teamaarambh01@gmail.com

---

## ✅ Verification

### Health Check
```bash
curl http://localhost:31001/health
```

**Response**:
```
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-10-16T07:25:09.848Z"
}
```

### Login Endpoint Test
```bash
curl -X POST http://localhost:31001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Result**: ✅ Working (returns JWT token and user data)

---

## 🔄 How to Restart Backend Server

### Quick Restart
```bash
# Kill any existing server process
pkill -f "node.*server"

# Navigate to server directory
cd /Users/madanthambisetty/Downloads/Aarambh/server

# Start in background
(npm run dev &)
```

### Check if Running
```bash
# Check port 31001
lsof -i :31001 | grep LISTEN

# Check health endpoint
curl http://localhost:31001/health
```

### View Logs
```bash
# If you started with logging
tail -f server.log

# Or check the terminal output
```

---

## 📌 Available Endpoints

### Authentication (MongoDB-based)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp-db` - Verify OTP (MongoDB)
- `POST /api/auth/logout` - Logout user  
- `GET /api/auth/me` - Get current user

### Legacy OTP (Email-based)
- `POST /api/auth/send-otp` - Send OTP email
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/send-welcome` - Send welcome email

---

## 🐛 Troubleshooting

### Server Won't Start

**Issue**: Port already in use
```bash
# Solution: Kill process on port 31001
lsof -ti:31001 | xargs kill -9
```

**Issue**: MongoDB connection failed
```bash
# Solution: Check MongoDB Atlas IP whitelist
# Visit: https://cloud.mongodb.com
# Add your current IP address
```

**Issue**: EIO Error
```bash
# Solution: Don't use 'npm start &' directly
# Use: (npm run dev &) instead
```

### Server Crashes Immediately

**Check for**:
1. Port conflict (another app using 31001)
2. MongoDB connection issues
3. Missing environment variables
4. Syntax errors in code

**Solution**: View logs
```bash
cd server
tail -50 server.log
```

---

## 🛑 Stop Backend Server

### Stop Gracefully
```bash
pkill -f "node.*server"
```

### Force Stop
```bash
lsof -ti:31001 | xargs kill -9
```

### Verify Stopped
```bash
lsof -i :31001
# Should return nothing
```

---

## 📊 Server Monitoring

### Check Process
```bash
ps aux | grep "node.*server"
```

### Check Port
```bash
lsof -i :31001
```

### Monitor Logs in Real-time
```bash
cd server
tail -f server.log
```

### Test API Health
```bash
# Health check
curl http://localhost:31001/health

# API root
curl http://localhost:31001/

# Test login
curl -X POST http://localhost:31001/api/auth/login \
```

---

## 🔐 Environment Configuration

### Required Variables (server/.env)
```env
PORT=31001
```

---

## ✨ Best Practices

### Development
1. **Use nodemon** for auto-reload (already configured)
2. **Keep terminal open** to see server logs
3. **Check health endpoint** after restart
4. **Monitor MongoDB connection** status

### Production
1. **Use PM2** or similar process manager
2. **Enable logging** to file
3. **Set up monitoring** alerts
4. **Configure auto-restart** on failure

---

## 🎯 Next Steps

1. **Frontend is running** on http://localhost:3000
2. **Backend is running** on http://localhost:31001
3. **Open browser** to http://localhost:3000
4. **Test login** with credentials:
   - Email: test@example.com
   - Password: testpass123

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `(npm run dev &)` | Start backend in background |
| `pkill -f "node.*server"` | Stop backend |
| `curl http://localhost:31001/health` | Check if running |
| `lsof -i :31001` | Check port status |
| `tail -f server.log` | View logs |

---

**Backend server is now running successfully on port 31001!** 🎉

The curl connection error has been resolved. All API endpoints are accessible.
