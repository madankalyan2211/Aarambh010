# Teacher-Student-Assignment Relationship System

## Overview
This document explains how the assignment filtering system works to ensure students only see assignments from their enrolled courses.

## Data Structure

### Teachers
- **Dr. Sarah Chen** (T001)
  - Teaches: AI & Machine Learning (C001), Neural Networks Advanced (C004)
  
- **Prof. Michael Ross** (T002)
  - Teaches: Web Development (C002)
  
- **Dr. Emma Wilson** (T003)
  - Teaches: Digital Marketing (C003)

### Example Student Enrollments

#### Student: john.doe@student.aarambh.edu
- **Enrolled Courses:**
  - C001 (AI & Machine Learning) - Teacher: Dr. Sarah Chen
  - C002 (Web Development) - Teacher: Prof. Michael Ross
- **Visible Assignments:**
  - AI Assignment #4 (from Dr. Sarah Chen)
  - Web Dev Project (from Prof. Michael Ross)
- **Hidden Assignments:**
  - Marketing Quiz (from Dr. Emma Wilson - not enrolled)

#### Student: jane.smith@student.aarambh.edu
- **Enrolled Courses:**
  - C001 (AI & Machine Learning) - Teacher: Dr. Sarah Chen
  - C003 (Digital Marketing) - Teacher: Dr. Emma Wilson
- **Visible Assignments:**
  - AI Assignment #4 (from Dr. Sarah Chen)
  - Marketing Quiz (from Dr. Emma Wilson)
- **Hidden Assignments:**
  - Web Dev Project (from Prof. Michael Ross - not enrolled)

#### Student: bob.wilson@student.aarambh.edu
- **Enrolled Courses:**
  - C002 (Web Development) - Teacher: Prof. Michael Ross
  - C003 (Digital Marketing) - Teacher: Dr. Emma Wilson
- **Visible Assignments:**
  - Web Dev Project (from Prof. Michael Ross)
  - Marketing Quiz (from Dr. Emma Wilson)
- **Hidden Assignments:**
  - AI Assignment #4 (from Dr. Sarah Chen - not enrolled)

## How It Works

### 1. Login Process
When a student logs in with their email (e.g., `john.doe@student.aarambh.edu`):
- Email is stored in App state
- Email is passed to StudentDashboard component

### 2. Assignment Filtering
```typescript
// In StudentDashboard.tsx
const studentAssignments = getStudentAssignments(userEmail);
```

The `getStudentAssignments()` function:
1. Finds the student by email
2. Gets their enrolled course IDs
3. Filters all assignments to only include those from enrolled courses
4. Sorts by urgency (days left)

### 3. Display Logic
- **Smart Next Step:** Shows the most urgent assignment from student's courses
- **Upcoming Deadlines:** Shows all assignments from student's courses
- **Empty State:** If no assignments, shows "🎉 No pending assignments!"

## Key Features

✅ **Teacher Isolation:** Students only see assignments from teachers whose courses they're enrolled in

✅ **Course-Based Filtering:** Assignments are filtered by courseId matching student's enrolledCourses

✅ **Dynamic Updates:** When teachers add new assignments, only enrolled students see them

✅ **Teacher Attribution:** Each assignment shows which teacher assigned it

✅ **Course Context:** Each assignment displays which course it belongs to

## Data Files

### `/src/data/mockData.ts`
Contains all the mock data and helper functions:
- `teachers[]` - List of teachers
- `students[]` - List of students with enrolled courses
- `courses[]` - List of courses with teacher assignments
- `assignments[]` - List of assignments with course/teacher IDs
- `getStudentAssignments(email)` - Filter assignments for specific student
- `getCourseById(id)` - Get course details
- `getTeacherById(id)` - Get teacher details

## Testing Different Students

To test the filtering, log in with different student emails:

1. **john.doe@student.aarambh.edu**
   - Will see: AI Assignment #4, Web Dev Project
   
2. **jane.smith@student.aarambh.edu**
   - Will see: AI Assignment #4, Marketing Quiz
   
3. **bob.wilson@student.aarambh.edu**
   - Will see: Web Dev Project, Marketing Quiz
   
4. **alice.johnson@student.aarambh.edu**
   - Will see: All three assignments (enrolled in all courses)

## Future Enhancements

- Database integration to replace mock data
- Real-time assignment creation by teachers
- Student enrollment management
- Assignment submission tracking
- Grade distribution per course/teacher
