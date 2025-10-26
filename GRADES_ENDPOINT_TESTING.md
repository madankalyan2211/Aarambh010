# Grades Endpoint Testing Guide

## Issue Identified
The error `{"success":false,"message":"Endpoint not found"}` occurs because:

1. **Placeholder Token**: "YOUR_JWT_TOKEN" is not a valid JWT token
2. **Authentication Required**: The grades endpoint requires a valid, authenticated user
3. **User Role**: The user must have the 'student' role for `/api/grades/student`

## Correct Testing Process

### Step 1: Register a User (if needed)
```bash
curl -X POST http://localhost:31001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test.student@example.com",
    "password": "securepassword123",
    "role": "student"
  }'
```

### Step 2: Login to Get JWT Token
```bash
curl -X POST http://localhost:31001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.student@example.com",
    "password": "securepassword123"
  }'
```

This will return a response like:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "Test Student",
    "email": "test.student@example.com",
    "role": "student"
  }
}
```

### Step 3: Use the Real Token to Access Grades
```bash
curl -X GET http://localhost:31001/api/grades/student \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Common Issues and Solutions

### 1. "Endpoint not found"
**Cause**: Incorrect URL path or missing authentication
**Solution**: 
- Ensure the URL is exactly `/api/grades/student`
- Include a valid Authorization header

### 2. "Not authorized to access this route"
**Cause**: Missing or invalid JWT token
**Solution**: 
- Use a real token from successful login
- Ensure the token hasn't expired

### 3. "Role 'X' is not authorized to access this route"
**Cause**: User doesn't have 'student' role
**Solution**: 
- Register user with `"role": "student"`
- Or use `/api/grades/teacher` for teacher users

### 4. "Please verify your email to access this route"
**Cause**: User account is not verified
**Solution**: 
- Check user's `isVerified` field in database
- Or temporarily modify auth middleware for testing

## Complete Test Script

Run the provided test script:
```bash
cd /Users/madanthambisetty/Downloads/Aarambh
./test-grades-endpoint.sh
```

## Backend Route Structure

The grades routes are defined as:
- **Student grades**: `GET /api/grades/student` (requires student role)
- **Teacher grades**: `GET /api/grades/teacher` (requires teacher/admin role)
- **Specific student report**: `GET /api/grades/student/:studentId/course/:courseId` (requires teacher/admin role)

## Frontend Integration

The frontend calls these endpoints through `api.service.ts`:
- `getStudentGrades()` → `/api/grades/student`
- `getTeacherGrades()` → `/api/grades/teacher`
- `getStudentGradeReport()` → `/api/grades/student/:studentId/course/:courseId`

## Troubleshooting Checklist

- [ ] User account exists in database
- [ ] User has correct role ('student' for student grades)
- [ ] User is verified (`isVerified: true`)
- [ ] JWT token is valid and not expired
- [ ] Correct endpoint URL is used
- [ ] Authorization header is properly formatted
- [ ] Backend server is running on port 31001

## Testing with Existing Users

If you have existing users in your database, you can:

1. Find a student user in MongoDB:
```bash
# Connect to MongoDB and find users
# db.users.find({role: "student"}).pretty()
```

2. Use the user's credentials to login and get a token

3. Use that token to access the grades endpoint

This should resolve the "Endpoint not found" issue you're experiencing.