# User Registration with MongoDB - Complete Guide

## ✅ Yes! All New Users Are Saved to MongoDB Atlas

When someone registers (student/teacher/admin), their data is **automatically saved** to your MongoDB Atlas cloud database.

## 🔄 Complete Registration Flow

### Step 1: User Registers

**Frontend Form:**
```
Name: John Doe
Email: john.doe@student.aarambh.edu
Password: securePassword123
Role: Student
```

**API Call:**
```javascript
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@student.aarambh.edu",
  "password": "securePassword123",
  "role": "student"
}
```

### Step 2: Backend Saves to MongoDB

**What Happens in Code** ([`authController.js`](file:///Users/madanthambisetty/Downloads/Aarambh/server/controllers/authController.js)):

```javascript
// 1. Check if user exists
const existingUser = await User.findOne({ email });

// 2. Create user in MongoDB
const user = await User.create({
  name: "John Doe",
  email: "john.doe@student.aarambh.edu",
  password: "securePassword123", // ← Automatically hashed!
  role: "student"
});

// 3. User is now in MongoDB! ✅
```

### Step 3: What Gets Saved to MongoDB

**Document Created in `users` Collection:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@student.aarambh.edu",
  "password": "$2a$10$XQW8...", // ← Hashed password (secure!)
  "role": "student",
  "enrolledCourses": [],
  "teachingCourses": [],
  "avatar": "",
  "bio": "",
  "learningStreak": 0,
  "totalXP": 0,
  "badges": [],
  "isVerified": false, // ← Will be true after OTP
  "isActive": true,
  "otp": {
    "code": "123456",
    "expiresAt": "2024-01-15T10:30:00.000Z"
  },
  "createdAt": "2024-01-15T10:20:00.000Z",
  "updatedAt": "2024-01-15T10:20:00.000Z"
}
```

### Step 4: OTP Verification Updates MongoDB

**When User Verifies OTP:**

```javascript
// MongoDB update
user.isVerified = true; // ← User is now verified!
user.otp = undefined;    // ← Clear OTP
await user.save();       // ← Save to MongoDB
```

## 📊 View Your Registered Users

### Method 1: Use the Script

```bash
cd server
npm run view-users
```

**Output:**
```
🔍 Connecting to MongoDB Atlas...
✅ Connected!

📊 Total Users: 3

👥 Registered Users:

════════════════════════════════════════════════════════════════════════════════

1. John Doe
   Email: john.doe@student.aarambh.edu
   Role: STUDENT
   Verified: ✅
   Registered: 1/15/2024, 10:20:00 AM
   ID: 507f1f77bcf86cd799439011

2. Dr. Sarah Chen
   Email: sarah.chen@aarambh.edu
   Role: TEACHER
   Verified: ✅
   Registered: 1/15/2024, 9:15:00 AM
   ID: 507f1f77bcf86cd799439012

3. Admin User
   Email: admin@aarambh.edu
   Role: ADMIN
   Verified: ✅
   Registered: 1/15/2024, 8:00:00 AM
   ID: 507f1f77bcf86cd799439013

════════════════════════════════════════════════════════════════════════════════

📈 Statistics:
   Students: 1
   Teachers: 1
   Admins: 1
   Verified: 3/3

✅ Done!
```

### Method 2: MongoDB Atlas Dashboard

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Browse Collections"**
3. Select **`aarambh-lms`** database
4. Click **`users`** collection
5. See all registered users!

![MongoDB Atlas View](https://i.imgur.com/example.png)

### Method 3: MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with your connection string
3. Navigate to `aarambh-lms` → `users`
4. Browse all users visually

### Method 4: API Endpoint (Protected)

```bash
# First, register and get token
# Then use token to get user list

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Test Registration Right Now

### Step 1: Start Server

```bash
cd server
npm run dev
```

### Step 2: Register a Test User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@student.aarambh.edu",
    "password": "password123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "test@student.aarambh.edu",
    "name": "Test Student",
    "role": "student"
  }
}
```

### Step 3: Check MongoDB

```bash
npm run view-users
```

You should see your new user! ✅

## 🔐 Security Features

### 1. Password Hashing

Passwords are **automatically hashed** before saving:

```javascript
// In User model (User.js)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // ← Hashed!
  next();
});
```

**In Database:**
```
Original: "password123"
Saved: "$2a$10$XQW8rYG9kM8LfEz5K9nB9OQW..." // ← Secure!
```

### 2. Unique Email Validation

```javascript
email: {
  type: String,
  unique: true, // ← No duplicate emails!
}
```

### 3. Role Validation

```javascript
role: {
  type: String,
  enum: ['student', 'teacher', 'admin'], // ← Only valid roles!
  default: 'student',
}
```

## 📝 User Data Structure

### Student Profile
```json
{
  "role": "student",
  "enrolledCourses": [
    "courseId1",
    "courseId2"
  ],
  "learningStreak": 14,
  "totalXP": 1250,
  "badges": [
    {
      "name": "7-Day Streak",
      "icon": "🔥",
      "earnedAt": "2024-01-10"
    }
  ]
}
```

### Teacher Profile
```json
{
  "role": "teacher",
  "teachingCourses": [
    "courseId1",
    "courseId2"
  ],
  "bio": "PhD in Computer Science"
}
```

### Admin Profile
```json
{
  "role": "admin",
  "permissions": ["manage_users", "manage_courses"]
}
```

## 🔍 Query Examples

### Find All Students

```javascript
const students = await User.find({ role: 'student' });
```

### Find Verified Users

```javascript
const verified = await User.find({ isVerified: true });
```

### Find User by Email

```javascript
const user = await User.findOne({ 
  email: 'john@student.aarambh.edu' 
});
```

### Get User with Courses

```javascript
const user = await User.findById(userId)
  .populate('enrolledCourses')
  .populate('teachingCourses');
```

## 📊 Collections in Your Database

After users register, these collections exist:

```
aarambh-lms/
├── users           ✅ All registered users
├── courses         ✅ Created when teacher makes course
├── assignments     ✅ Created when teacher assigns work
├── submissions     ✅ Created when student submits
├── discussions     ✅ Created when user posts
└── notifications   ✅ Created when alerts sent
```

## 🎯 Complete User Lifecycle

### 1. Registration
```
User fills form → POST /api/auth/register → Saved to MongoDB ✅
```

### 2. Email Verification
```
OTP sent → User enters OTP → isVerified = true → Updated in MongoDB ✅
```

### 3. Login
```
User logs in → POST /api/auth/login → Verify password → Send OTP → JWT token
```

### 4. Course Enrollment
```
Student enrolls → enrolledCourses array updated → Saved to MongoDB ✅
```

### 5. Profile Updates
```
User updates profile → PATCH /api/users/profile → Updated in MongoDB ✅
```

## 🚀 Quick Commands

```bash
# View all registered users
npm run view-users

# Test database connection
npm run test-db

# Start server
npm run dev

# Register a user via curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@edu","password":"pass123","role":"student"}'
```

## ✅ Summary

**Q: Are new users saved to MongoDB?**  
**A: YES! ✅**

- Registration → MongoDB Atlas Cloud
- Verification → Updated in MongoDB
- Login → Retrieved from MongoDB
- All data → Persisted in cloud database

**Location:** `mongodb+srv://...@aarambh.bozwgdv.mongodb.net/aarambh-lms`  
**Collection:** `users`  
**Security:** Passwords hashed, emails unique  
**Accessible:** Via Atlas dashboard, Compass, or scripts

Your LMS is using a real, production-ready cloud database! 🎉
