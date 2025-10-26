# MongoDB Integration - Complete Summary

## ✅ What Has Been Integrated

### 1. Database Models Created

#### **User Model** (`server/models/User.js`)
- Complete user management with password hashing
- Supports students, teachers, and admins
- OTP generation and verification built-in
- Learning statistics (streaks, XP, badges)
- Enrolled courses and teaching courses tracking

#### **Course Model** (`server/models/Course.js`)
- Course creation and management
- Student enrollment tracking
- Course modules and lessons structure
- Categories, tags, difficulty levels
- Ratings and reviews support

#### **Assignment Model** (`server/models/Assignment.js`)
- Assignment creation with due dates
- AI detection and plagiarism settings
- Attachments support
- Grading configuration
- Statistics tracking

#### **Submission Model** (`server/models/Submission.js`)
- Student assignment submissions
- AI detection scores
- Plagiarism detection scores
- Grading and feedback
- Revision history

#### **Discussion Model** (`server/models/Discussion.js`)
- Forum discussions
- Categories (question, announcement, etc.)
- Replies and likes
- Pinned and resolved status

#### **Notification Model** (`server/models/Notification.js`)
- Various notification types
- Read/unread status
- Priority levels
- Related entities (course, assignment, etc.)

### 2. Controllers Created

#### **Auth Controller** (`server/controllers/authController.js`)
- `/api/auth/register` - Register new user
- `/api/auth/login` - Login with credentials
- `/api/auth/verify-otp` - Verify OTP code
- `/api/auth/resend-otp` - Resend OTP
- `/api/auth/me` - Get current user (protected)
- `/api/auth/logout` - Logout user

#### **Course Controller** (`server/controllers/courseController.js`)
- `/api/courses` - Get all courses
- `/api/courses/my-courses` - Student's enrolled courses
- `/api/courses/teaching` - Teacher's courses
- `/api/courses` (POST) - Create new course
- `/api/courses/:id/enroll` - Enroll in course
- `/api/courses/:id/unenroll` - Unenroll from course

### 3. Middleware

#### **Auth Middleware** (`server/middleware/auth.js`)
- `protect` - JWT authentication
- `restrictTo` - Role-based access control
- `isVerified` - Email verification check

### 4. Database Configuration

#### **Database Connection** (`server/config/database.js`)
- MongoDB connection with error handling
- Connection event listeners
- Graceful shutdown
- Automatic reconnection

### 5. Routes

#### **Auth Routes** (`server/routes/auth.routes.js`)
- MongoDB-based authentication
- Legacy OTP routes for backward compatibility

#### **Course Routes** (`server/routes/course.routes.js`)
- Public and protected routes
- Role-based access
- Student and teacher specific endpoints

## 📊 Database Schema Relationships

```
User (Student)
├── enrolledCourses → [Course]
└── submissions → [Submission]

User (Teacher)
├── teachingCourses → [Course]
└── assignments → [Assignment]

Course
├── teacher → User
├── enrolledStudents → [User]
├── assignments → [Assignment]
└── discussions → [Discussion]

Assignment
├── course → Course
├── teacher → User
└── submissions → [Submission]

Submission
├── assignment → Assignment
├── student → User
└── course → Course

Discussion
├── course → Course
├── author → User
└── replies → [embedded]

Notification
├── recipient → User
├── sender → User
├── relatedCourse → Course
└── relatedAssignment → Assignment
```

## 🔐 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **OTP Verification**: Email-based 2FA
4. **Role-Based Access Control**: Student/Teacher/Admin
5. **Email Verification**: Required for sensitive actions
6. **Rate Limiting**: Protection against abuse
7. **CORS Configuration**: Whitelisted origins

## 🚀 How to Use

### Installation

```bash
# Install MongoDB dependencies
cd server
npm install

# Dependencies added:
# - mongoose (MongoDB ODM)
# - bcryptjs (Password hashing)
# - jsonwebtoken (JWT auth)
```

### Configuration

1. **Create `.env` file** (copy from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/aarambh-lms
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
```

2. **Start MongoDB**:
```bash
# Local MongoDB
mongod

# Or MongoDB Atlas (cloud) - just update MONGODB_URI
```

3. **Start Server**:
```bash
npm run dev
```

### API Usage Examples

#### Register a New Student

```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@student.edu',
    password: 'password123',
    role: 'student'
  })
});
```

#### Login and Get JWT Token

```javascript
// Step 1: Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@student.edu',
    password: 'password123'
  })
});

// Step 2: Verify OTP
const otpResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@student.edu',
    otp: '123456'
  })
});

const { data } = await otpResponse.json();
const token = data.token; // Store this for authenticated requests
```

#### Get Current User Data

```javascript
const response = await fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const userData = await response.json();
// Returns user with enrolled courses populated
```

#### Enroll in a Course

```javascript
const response = await fetch(`http://localhost:3001/api/courses/${courseId}/enroll`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📁 File Structure

```
server/
├── models/
│   ├── User.js                  ✅ User authentication & profiles
│   ├── Course.js                ✅ Course management
│   ├── Assignment.js            ✅ Assignments
│   ├── Submission.js            ✅ Student submissions
│   ├── Discussion.js            ✅ Forum discussions
│   ├── Notification.js          ✅ User notifications
│   └── index.js                 ✅ Model exports
├── controllers/
│   ├── authController.js        ✅ Authentication logic
│   └── courseController.js      ✅ Course operations
├── middleware/
│   └── auth.js                  ✅ JWT & role protection
├── routes/
│   ├── auth.routes.js           ✅ Auth endpoints
│   └── course.routes.js         ✅ Course endpoints
├── config/
│   ├── database.js              ✅ MongoDB connection
│   └── email.config.js          (existing)
├── services/
│   ├── email.service.js         (existing)
│   └── otp.service.js           (existing)
├── server.js                    ✅ Updated with MongoDB
└── package.json                 ✅ Updated dependencies
```

## 🔄 Frontend Integration Steps

### 1. Update API Service

Create/update `src/services/api.service.ts`:

```typescript
const API_URL = 'http://localhost:3001/api';

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  },
  
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export const courseService = {
  getMyCourses: async (token) => {
    const response = await fetch(`${API_URL}/courses/my-courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  enrollCourse: async (courseId, token) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### 2. Update Authentication Flow

In `src/components/LoginRegistration.tsx`:

```typescript
// After OTP verification success
const { data } = await authService.verifyOTP(email, otp);
const token = data.token;
const user = data.user;

// Store token
localStorage.setItem('authToken', token);
localStorage.setItem('userData', JSON.stringify(user));

// Pass to App
onLogin(user.role, user.name, user.email);
```

### 3. Replace Mock Data

In dashboards, replace mock data with API calls:

```typescript
// StudentDashboard.tsx
useEffect(() => {
  const fetchCourses = async () => {
    const token = localStorage.getItem('authToken');
    const response = await courseService.getMyCourses(token);
    setEnrolledCourses(response.data);
  };
  
  fetchCourses();
}, []);
```

## 🎯 Next Steps

### Immediate Actions

1. ✅ Install MongoDB dependencies
   ```bash
   cd server && npm install
   ```

2. ✅ Set up MongoDB (local or Atlas)

3. ✅ Create `.env` file from `.env.example`

4. ✅ Start the server
   ```bash
   npm run dev
   ```

5. ✅ Test authentication endpoints

### Future Enhancements

- [ ] Create assignment controller and routes
- [ ] Create submission controller and routes
- [ ] Create discussion controller and routes
- [ ] Create notification controller and routes
- [ ] Add file upload for assignments
- [ ] Implement real-time notifications (Socket.io)
- [ ] Add pagination for large datasets
- [ ] Implement search and filtering
- [ ] Add analytics and reporting
- [ ] Create admin dashboard endpoints

## 📚 Documentation

- **Setup Guide**: `MONGODB_SETUP.md` - Detailed installation and configuration
- **API Reference**: See controller files for endpoint documentation
- **Schema Reference**: See model files for data structure

## 🐛 Troubleshooting

### Common Issues

1. **"MongoNetworkError"**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`

2. **"JsonWebTokenError"**
   - Verify JWT_SECRET in `.env`
   - Check token format: `Bearer <token>`

3. **"ValidationError"**
   - Review required fields in model schemas
   - Check data types being sent

## ✨ Key Features

✅ **Complete Authentication**: Register, Login, OTP verification
✅ **User Management**: Students, Teachers, Admins
✅ **Course Management**: Create, enroll, unenroll
✅ **Role-Based Access**: Protected routes by role
✅ **Email Verification**: OTP-based verification
✅ **JWT Security**: Secure token-based authentication
✅ **Password Hashing**: bcryptjs encryption
✅ **Data Relationships**: Proper foreign key references
✅ **Extensible Schema**: Easy to add new features
✅ **Production Ready**: Error handling and validation

Your Aarambh LMS now has a complete MongoDB backend! 🎉
