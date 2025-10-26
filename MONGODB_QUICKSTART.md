# MongoDB Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 minute)

```bash
cd server
npm install mongoose bcryptjs jsonwebtoken
```

### Step 2: Start MongoDB (1 minute)

**Choose ONE option:**

**Option A - Local MongoDB (Recommended for development)**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B - MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster
3. Get connection string

### Step 3: Configure Environment (2 minutes)

Create `.env` file in `server/` directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/aarambh-lms

# JWT
JWT_SECRET=change-this-to-a-random-secret-key-for-production
JWT_EXPIRES_IN=7d

# Email (existing)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Server
PORT=3001
NODE_ENV=development
```

### Step 4: Start Server (1 minute)

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: aarambh-lms
🚀 Server running on: http://localhost:3001
```

## ✅ Test the Integration

### Test 1: Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
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
    "email": "student@test.com",
    "name": "Test Student",
    "role": "student"
  }
}
```

### Test 2: Verify OTP

Check your console for the OTP, then:

```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type": "application/json" \
  -d '{
    "email": "student@test.com",
    "otp": "123456"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

## 🎯 That's It!

Your MongoDB integration is complete! You now have:

✅ User registration with email OTP
✅ JWT authentication
✅ Role-based access (student/teacher/admin)
✅ Course enrollment system
✅ Complete database schemas

## 📝 Next Steps

1. **Update Frontend** to use the new API endpoints
2. **Test with Postman** for detailed API exploration
3. **View data** in MongoDB Compass
4. **Read** `MONGODB_SETUP.md` for detailed documentation

## 🔍 View Your Data

**MongoDB Compass:**
1. Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse `aarambh-lms` database

**MongoDB Shell:**
```bash
# Connect
mongo

# Switch to database
use aarambh-lms

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()
```

## 🆘 Troubleshooting

**"MongoNetworkError"**
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
systemctl status mongod             # Linux
```

**"Cannot find module 'mongoose'"**
```bash
npm install mongoose bcryptjs jsonwebtoken
```

**"JWT secret not defined"**
- Add `JWT_SECRET` to `.env` file

## 📚 Documentation

- Full Setup: `MONGODB_SETUP.md`
- Summary: `MONGODB_INTEGRATION_SUMMARY.md`
- Models: `server/models/`
- Controllers: `server/controllers/`

Happy coding! 🎉
