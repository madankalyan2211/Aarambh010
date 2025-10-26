# MongoDB Integration Setup Guide

## Overview
This guide explains how to set up and use MongoDB with your Aarambh LMS application.

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** installed locally OR MongoDB Atlas account
3. **npm** or **yarn** package manager

## 🚀 Installation Steps

### 1. Install MongoDB Dependencies

```bash
cd server
npm install mongoose bcryptjs jsonwebtoken
```

### 2. Choose Your MongoDB Setup

#### Option A: Local MongoDB

**Install MongoDB:**
- macOS: `brew install mongodb-community`
- Ubuntu: `sudo apt-get install mongodb`
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

**Start MongoDB:**
```bash
# macOS/Linux
mongod --dbpath /path/to/data/directory

# Or use brew services (macOS)
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### 3. Configure Environment Variables

Create/update `.env` file in the `server` directory:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/aarambh-lms

# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aarambh-lms?retryWrites=true&w=majority

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Other existing variables...
```

## 📊 Database Schema

### Collections Created

1. **users** - Students, Teachers, and Admins
2. **courses** - Course information
3. **assignments** - Assignments created by teachers
4. **submissions** - Student assignment submissions
5. **discussions** - Forum discussions
6. **notifications** - User notifications

### User Schema Fields

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'teacher' | 'admin',
  enrolledCourses: [CourseID],
  teachingCourses: [CourseID],
  avatar: String,
  bio: String,
  learningStreak: Number,
  totalXP: Number,
  badges: Array,
  isVerified: Boolean,
  isActive: Boolean,
  otp: { code, expiresAt },
  createdAt: Date,
  updatedAt: Date
}
```

### Course Schema Fields

```javascript
{
  name: String,
  description: String,
  image: String,
  teacher: UserID,
  modules: [{
    title, description, lessons: [...]
  }],
  enrolledStudents: [UserID],
  maxStudents: Number,
  isPublished: Boolean,
  category: String,
  difficulty: String,
  totalEnrollments: Number,
  averageRating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment Schema Fields

```javascript
{
  title: String,
  description: String,
  course: CourseID,
  teacher: UserID,
  dueDate: Date,
  totalPoints: Number,
  passingScore: Number,
  instructions: String,
  attachments: Array,
  allowLateSubmission: Boolean,
  enableAIDetection: Boolean,
  enablePlagiarismCheck: Boolean,
  totalSubmissions: Number,
  averageScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/resend-otp        - Resend OTP
GET    /api/auth/me                - Get current user (protected)
POST   /api/auth/logout            - Logout (protected)
```

### Courses

```
GET    /api/courses                - Get all courses
GET    /api/courses/my-courses     - Get student's courses (protected)
GET    /api/courses/teaching       - Get teacher's courses (protected)
POST   /api/courses                - Create course (teacher only)
POST   /api/courses/:id/enroll     - Enroll in course (student only)
DELETE /api/courses/:id/unenroll   - Unenroll from course (student only)
```

## 🔐 Authentication Flow

### Registration Flow

1. User fills registration form (name, email, password, role)
2. Frontend sends POST to `/api/auth/register`
3. Backend:
   - Creates user in MongoDB
   - Generates OTP
   - Sends OTP email
   - Returns userId and email
4. Frontend shows OTP verification screen
5. User enters OTP
6. Frontend sends POST to `/api/auth/verify-otp`
7. Backend:
   - Verifies OTP
   - Marks user as verified
   - Returns JWT token
8. Frontend stores token and redirects to dashboard

### Login Flow

1. User enters email and password
2. Frontend sends POST to `/api/auth/login`
3. Backend:
   - Validates credentials
   - Generates OTP
   - Sends OTP email
4. User enters OTP
5. Frontend sends POST to `/api/auth/verify-otp`
6. Backend returns JWT token
7. Frontend stores token

## 🛠️ Usage Examples

### Register a New Student

```javascript
// Frontend (React)
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@student.aarambh.edu',
    password: 'securePassword123',
    role: 'student'
  })
});

const data = await response.json();
// Store userId and email for OTP verification
```

### Verify OTP

```javascript
const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john.doe@student.aarambh.edu',
    otp: '123456'
  })
});

const data = await response.json();
// Store JWT token
localStorage.setItem('token', data.data.token);
```

### Get Current User (Protected Route)

```javascript
const response = await fetch('http://localhost:3001/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const data = await response.json();
// Returns user profile with enrolled courses
```

### Enroll in a Course

```javascript
const response = await fetch(`http://localhost:3001/api/courses/${courseId}/enroll`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## 🧪 Testing MongoDB Connection

```bash
# Start your server
cd server
npm run dev

# Check console output for:
✅ MongoDB Connected: localhost
📊 Database: aarambh-lms

# Test API endpoints
curl http://localhost:3001/health
```

## 📝 Data Migration

### Migrate from Mock Data to MongoDB

To populate your database with initial data:

1. Create a seed script:

```javascript
// server/scripts/seed.js
const mongoose = require('mongoose');
const { User, Course, Assignment } = require('../models');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Create teachers
  const teacher1 = await User.create({
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@aarambh.edu',
    password: 'password123',
    role: 'teacher',
    isVerified: true,
  });
  
  // Create courses
  const course1 = await Course.create({
    name: 'AI & Machine Learning',
    description: 'Master the fundamentals of AI',
    teacher: teacher1._id,
    isPublished: true,
  });
  
  console.log('✅ Database seeded');
  process.exit(0);
}

seed();
```

2. Run seed script:
```bash
node server/scripts/seed.js
```

## 🔍 MongoDB Monitoring

### View Data in MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections and documents

### Using MongoDB Shell

```bash
# Connect to local MongoDB
mongo

# Switch to database
use aarambh-lms

# View collections
show collections

# Query users
db.users.find().pretty()

# Count documents
db.users.countDocuments()
```

## 🚨 Troubleshooting

### Connection Issues

**Error: "MongoNetworkError"**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

**Error: "Authentication failed"**
- Verify MongoDB Atlas credentials
- Whitelist your IP address (Atlas)

### Common Issues

1. **"Cannot find module 'mongoose'"**
   ```bash
   npm install mongoose
   ```

2. **"ECONNREFUSED"**
   - Start MongoDB: `brew services start mongodb-community`
   - Or use MongoDB Atlas

3. **"Validation Error"**
   - Check required fields in schemas
   - Verify data types

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [JWT.io](https://jwt.io/) - JWT debugger

## 🔄 Next Steps

1. ✅ Set up MongoDB
2. ✅ Configure environment variables
3. ✅ Test authentication endpoints
4. ✅ Create seed data
5. Update frontend to use new API endpoints
6. Implement remaining features (assignments, submissions, etc.)
7. Add data validation and error handling
8. Implement file uploads for assignments
9. Add real-time notifications
10. Set up production database

## 📞 Support

For issues or questions:
- Check the error logs in console
- Verify `.env` configuration
- Ensure MongoDB is running
- Review API endpoint documentation
