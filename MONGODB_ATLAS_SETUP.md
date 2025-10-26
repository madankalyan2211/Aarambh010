# MongoDB Atlas Setup Guide

## ✅ Your MongoDB Atlas Connection

Your connection string has been configured:

```
mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms
```

**Database Name:** `aarambh-lms`
**Cluster:** `aarambh.bozwgdv.mongodb.net`

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Test Connection

```bash
# Test if MongoDB Atlas is accessible
node test-connection.js
```

You should see:
```
✅ SUCCESS! MongoDB Atlas Connected
📊 Database Host: aarambh.bozwgdv.mongodb.net
📊 Database Name: aarambh-lms
🎉 MongoDB Atlas is ready to use!
```

### Step 3: Start Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB Connected: aarambh-bozwgdv-shard-00-02.bozwgdv.mongodb.net
📊 Database: aarambh-lms
🚀 Server running on: http://localhost:3001
```

## 🔐 Important Security Notes

### 1. **Whitelist IP Address**

Your current IP must be whitelisted in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to: **Network Access** → **IP Access List**
3. Click **"ADD IP ADDRESS"**
4. Options:
   - **Add Current IP Address** (for development)
   - **Allow Access from Anywhere** (`0.0.0.0/0`) - for testing only!

### 2. **Password Special Characters**

Your password contains `$` which is a special character. The connection string is properly formatted, but if you have issues:

- MongoDB Atlas URL encodes special characters automatically
- If errors occur, try escaping: `Aarambh143%24` ($ = %24)

### 3. **Keep Credentials Secret**

⚠️ **IMPORTANT:** Your credentials are now in `.env` file

**DO NOT:**
- Commit `.env` to Git
- Share connection string publicly
- Use same password for production

**DO:**
- Add `.env` to `.gitignore`
- Use different credentials for production
- Rotate passwords regularly

## 📋 Verify Your Setup

### Check 1: Environment Variables

```bash
# Verify .env file exists
cat server/.env | grep MONGODB_URI
```

Should show (with password hidden):
```
MONGODB_URI=mongodb+srv://Aarambh01:****@aarambh.bozwgdv.mongodb.net/...
```

### Check 2: Test API Endpoint

Start server and test:

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:3001/health
```

### Check 3: Register a Test User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@aarambh.edu",
    "password": "password123",
    "role": "student"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "...",
    "email": "test@aarambh.edu",
    "name": "Test User",
    "role": "student"
  }
}
```

## 🔍 View Your Data

### Option 1: MongoDB Atlas Web Interface

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Browse Collections"**
3. Select `aarambh-lms` database
4. View collections: `users`, `courses`, `assignments`, etc.

### Option 2: MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Click **"New Connection"**
3. Paste connection string:
   ```
   mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/
   ```
4. Click **"Connect"**
5. Browse `aarambh-lms` database

### Option 3: MongoDB Shell

```bash
# Install MongoDB Shell
brew install mongosh  # macOS
# or download from mongodb.com/try/download/shell

# Connect
mongosh "mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/"

# Switch to database
use aarambh-lms

# View users
db.users.find().pretty()

# Count documents
db.users.countDocuments()
```

## 🐛 Troubleshooting

### Error: "MongoNetworkError"

**Cause:** IP address not whitelisted

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Or temporarily allow all IPs: `0.0.0.0/0`

### Error: "Authentication failed"

**Cause:** Incorrect credentials

**Solution:**
1. Verify username: `Aarambh01`
2. Verify password: `Aarambh143$`
3. Check for typos in `.env` file

### Error: "Server selection timeout"

**Causes:**
- Internet connection issues
- Firewall blocking MongoDB ports
- VPN interfering

**Solutions:**
1. Check internet connection
2. Disable VPN temporarily
3. Check firewall settings

### Error: "Module not found: mongoose"

**Solution:**
```bash
cd server
npm install mongoose bcryptjs jsonwebtoken
```

## 📊 Database Structure

After running the app, these collections will be created:

```
aarambh-lms/
├── users               # Students, Teachers, Admins
├── courses             # Course information
├── assignments         # Assignments
├── submissions         # Student submissions
├── discussions         # Forum posts
└── notifications       # User notifications
```

## 🎯 Next Steps

1. ✅ Test connection: `node test-connection.js`
2. ✅ Start server: `npm run dev`
3. ✅ Register a test user via API
4. ✅ Verify user in MongoDB Atlas
5. ✅ Update frontend to use MongoDB API endpoints
6. ✅ Test complete user flow

## 📝 Configuration Files Updated

✅ `server/.env` - Contains your MongoDB Atlas URI
✅ `.env.example` - Template with your connection
✅ `server/test-connection.js` - Connection test script

## 🔄 Production Deployment

When deploying to production:

1. **Create Production Database**
   - Create separate MongoDB Atlas cluster for production
   - Use different credentials

2. **Update Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://prod-user:prod-pass@...
   JWT_SECRET=different-secret-key-for-production
   ```

3. **Security Checklist**
   - [ ] Use strong, unique passwords
   - [ ] Whitelist only production server IPs
   - [ ] Enable MongoDB Atlas monitoring
   - [ ] Set up automated backups
   - [ ] Use SSL/TLS certificates
   - [ ] Implement rate limiting

## 📞 Support

**MongoDB Atlas Issues:**
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Support](https://www.mongodb.com/support)

**Application Issues:**
- Check server logs: `npm run dev`
- Review error messages
- Verify `.env` configuration

## 🎉 You're All Set!

Your Aarambh LMS is now connected to MongoDB Atlas cloud database! 

**Test it now:**
```bash
cd server
node test-connection.js
npm run dev
```

Happy coding! 🚀
