# Teacher-Student Enrollment System

## Overview
A complete teacher-student enrollment system integrated with MongoDB that allows:
- **Students**: Browse all available teachers and enroll with them
- **Teachers**: View all students who have enrolled with them

## Backend API

### Endpoints Created

#### For Students:
- **GET** `/api/enrollment/teachers` - Get all available teachers
- **GET** `/api/enrollment/my-teachers` - Get student's enrolled teachers
- **POST** `/api/enrollment/enroll-teacher` - Enroll with a teacher
  ```json
  { "teacherId": "teacher_id_here" }
  ```
- **POST** `/api/enrollment/unenroll-teacher` - Unenroll from a teacher
  ```json
  { "teacherId": "teacher_id_here" }
  ```

#### For Teachers:
- **GET** `/api/enrollment/my-students` - Get all students enrolled with the teacher

### Database Schema Updates

Added to `User` model:
```javascript
enrolledTeachers: [{ type: ObjectId, ref: 'User' }]  // For students
students: [{ type: ObjectId, ref: 'User' }]           // For teachers
```

## How It Works

### Student Flow:
1. Student logs in
2. Goes to "My Teachers" page
3. Sees two lists:
   - **Available Teachers**: All teachers in the system
   - **My Teachers**: Teachers they're enrolled with
4. Can click "Enroll" to add a teacher
5. Can click "Unenroll" to remove a teacher

### Teacher Flow:
1. Teacher logs in
2. Goes to "My Students" page  
3. Sees all students who enrolled with them
4. Can view student details, courses, progress

## Testing

### Step 1: Create Test Users

Create teachers:
```bash
cd server
node add-user.js
# Create users with role='teacher'
```

Create students:
```bash
node add-user.js
# Create users with role='student'
```

### Step 2: Test API

```bash
# Login as student
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'

# Save the token, then:

# Get all teachers
curl http://localhost:3001/api/enrollment/teachers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enroll with a teacher
curl -X POST http://localhost:3001/api/enrollment/enroll-teacher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"teacherId":"TEACHER_ID"}'

# View my teachers
curl http://localhost:3001/api/enrollment/my-teachers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Test as Teacher

```bash
# Login as teacher
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"password123"}'

# View students
curl http://localhost:3001/api/enrollment/my-students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Files Created/Modified

### Backend:
- ✅ `server/controllers/enrollmentController.js` - New controller
- ✅ `server/routes/enrollment.routes.js` - New routes
- ✅ `server/models/User.js` - Updated schema
- ✅ `server/server.js` - Added enrollment routes

### Frontend:
- ✅ `src/services/api.service.ts` - Added enrollment API functions
- 🔄 `src/components/MyTeachersPage.tsx` - Needs update to use real API
- 🔄 `src/components/MyStudentsPage.tsx` - Needs update to use real API

## Next Steps

To complete the frontend integration, you need to:

1. **Update MyTeachersPage.tsx** to fetch from real API
2. **Update MyStudentsPage.tsx** to fetch from real API
3. Test the enrollment flow end-to-end

I can provide the complete updated components if needed!

## Quick Reference

### Student enrolling with teacher:
```javascript
POST /api/enrollment/enroll-teacher
Headers: Authorization: Bearer <token>
Body: { "teacherId": "64f..." }
```

### Student viewing their teachers:
```javascript
GET /api/enrollment/my-teachers
Headers: Authorization: Bearer <token>
```

### Teacher viewing their students:
```javascript
GET /api/enrollment/my-students
Headers: Authorization: Bearer <token>
```

---
Created: 2025-10-16
Status: Backend ✅ Complete | Frontend 🔄 In Progress
