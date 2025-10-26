# Course Enrollment System with Teacher Selection

## Overview
This document describes the comprehensive course enrollment system that allows students to enroll in courses with automatic teacher assignment and selection.

## Features Implemented

### 1. **Smart Enrollment Button** ✨
- Replaces static enrollment badge with dynamic "Enroll Now" / "Unenroll" buttons
- Only visible to **student users**
- Pink accent color (#FF69B4) for consistency with design theme
- Loading states during enrollment/unenrollment

### 2. **Teacher Selection Logic** 🎓

#### Case 1: No Teachers Assigned
**Behavior**: When a student clicks "Enroll Now" on a course with no assigned teachers:
- Shows alert: "No teachers have been assigned to this course yet. Please check back later."
- Prevents enrollment until a teacher is assigned

#### Case 2: Single Teacher
**Behavior**: When a student clicks "Enroll Now" on a course with exactly one teacher:
- **Automatically enrolls** the student with that teacher
- No dialog shown - seamless one-click enrollment
- Updates all related dashboards instantly

#### Case 3: Multiple Teachers
**Behavior**: When a student clicks "Enroll Now" on a course with multiple teachers:
- Opens a beautiful dialog with teacher selection
- Displays teacher cards showing:
  - Teacher name and email
  - Number of students
  - Number of courses taught
  - Teacher avatar/emoji
- Student clicks on a teacher card to enroll
- Updates all dashboards after enrollment

### 3. **Dual Enrollment System** 🔗
When a student enrolls in a course:
1. **Course Enrollment**: Student is added to `course.enrolledStudents`
2. **Teacher Enrollment**: Student is added to `teacher.students` AND `student.enrolledTeachers`

This creates a bidirectional relationship ensuring:
- Student sees the course in their dashboard
- Teacher sees the student in "My Students"
- Student sees the teacher in "My Teachers"

### 4. **Real-Time Dashboard Updates** 📊
After enrollment/unenrollment, the following are automatically updated:

#### Student Dashboard (`StudentDashboard.tsx`)
- **My Courses** section refreshes to show newly enrolled courses
- Displays all courses from enrolled teachers (automatic access)
- Shows progress, instructor info, and lesson count

#### My Teachers Page (`MyTeachersPage.tsx`)
- Automatically shows newly enrolled teachers
- Displays teacher's courses and student count
- Updates in real-time (30-second polling + manual refresh)

#### Teacher's My Students Page (`MyStudentsPage.tsx`)
- Teacher sees newly enrolled students immediately
- Shows student progress and course count
- Real-time updates via polling

## API Endpoints

### New Endpoints Created

#### 1. `POST /api/enrollment/enroll-course`
**Purpose**: Enroll student in course with teacher selection
**Access**: Students only
**Request Body**:
```json
{
  "courseId": "course_id_here",
  "teacherId": "teacher_id_here"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Successfully enrolled in course and with teacher",
  "data": {
    "courseId": "...",
    "courseName": "Web Development",
    "teacherId": "...",
    "teacherName": "Prof. Michael Ross"
  }
}
```

#### 2. `POST /api/enrollment/unenroll-course`
**Purpose**: Remove student from course
**Access**: Students only
**Request Body**:
```json
{
  "courseId": "course_id_here"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Successfully unenrolled from course"
}
```

## Backend Implementation

### Modified Files

#### 1. `server/controllers/enrollmentController.js`
**Added Functions**:
- `enrollInCourseWithTeacher()` - Handles course enrollment with teacher assignment
- `unenrollFromCourse()` - Handles course unenrollment

**Key Logic**:
```javascript
// Verify teacher teaches the course
const isTeachingCourse = teacher.teachingCourses.some(
  tc => tc.toString() === courseId
);

// Enroll in course
course.enrolledStudents.push(studentId);

// Enroll with teacher
student.enrolledTeachers.push(teacherId);
teacher.students.push(studentId);
```

#### 2. `server/routes/enrollment.routes.js`
**Added Routes**:
```javascript
router.post('/enroll-course', restrictTo('student'), enrollInCourseWithTeacher);
router.post('/unenroll-course', restrictTo('student'), unenrollFromCourse);
```

## Frontend Implementation

### Modified Files

#### 1. `src/components/CoursePage.tsx`
**New State**:
```typescript
const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
const [showTeacherDialog, setShowTeacherDialog] = useState(false);
const [selectedCourse, setSelectedCourse] = useState(null);
const [availableTeachers, setAvailableTeachers] = useState([]);
const [enrolling, setEnrolling] = useState(false);
```

**New Functions**:
- `handleEnrollClick()` - Determines enrollment flow based on teacher count
- `handleEnrollWithTeacher()` - Executes enrollment with selected teacher
- `handleUnenrollClick()` - Handles course unenrollment
- `getTeachersForCourse()` - Filters teachers by course

**UI Components**:
```tsx
// Enrollment Button
{userRole === 'student' && (
  enrolledCourseIds.has(course.id) ? (
    <Button onClick={() => handleUnenrollClick(course.id)}>
      Unenroll
    </Button>
  ) : (
    <Button onClick={() => handleEnrollClick(course)}>
      Enroll Now
    </Button>
  )
)}

// Teacher Selection Dialog
<Dialog open={showTeacherDialog}>
  <DialogContent>
    <DialogTitle>Select a Teacher</DialogTitle>
    {availableTeachers.map(teacher => (
      <Card onClick={() => handleEnrollWithTeacher(courseId, teacher.id)}>
        {/* Teacher info */}
      </Card>
    ))}
  </DialogContent>
</Dialog>
```

#### 2. `src/services/api.service.ts`
**New Functions**:
```typescript
export const enrollInCourseWithTeacher = async (
  courseId: string,
  teacherId: string
): Promise<ApiResponse> => {
  return apiRequest('/enrollment/enroll-course', {
    method: 'POST',
    body: JSON.stringify({ courseId, teacherId }),
  });
};

export const unenrollFromCourseNew = async (
  courseId: string
): Promise<ApiResponse> => {
  return apiRequest('/enrollment/unenroll-course', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};
```

## User Flow Diagrams

### Enrollment Flow
```
Student clicks "Enroll Now"
    ↓
Check teachers for this course
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   0 Teachers    │   1 Teacher     │  2+ Teachers    │
├─────────────────┼─────────────────┼─────────────────┤
│ Show alert      │ Auto-enroll     │ Show dialog     │
│ "No teachers"   │ with teacher    │ Select teacher  │
└─────────────────┴─────────────────┴─────────────────┘
    ↓                   ↓                   ↓
    Stop          Enroll with         Click teacher
                  teacher                   ↓
                      ↓             Enroll with
                      ↓             selected teacher
                      ↓                     ↓
                  ┌───────────────────────────┐
                  │   Enrollment Success      │
                  ├───────────────────────────┤
                  │ 1. Add to course roster   │
                  │ 2. Enroll with teacher    │
                  │ 3. Update dashboards      │
                  │ 4. Show success message   │
                  └───────────────────────────┘
```

### Data Updates Flow
```
Student Enrolls in Course
    ↓
┌──────────────────────────────────────────────────┐
│             Backend Updates                      │
├──────────────────────────────────────────────────┤
│ 1. course.enrolledStudents.push(studentId)      │
│ 2. student.enrolledTeachers.push(teacherId)     │
│ 3. teacher.students.push(studentId)             │
└──────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────┐
│           Frontend Refreshes                     │
├──────────────────────────────────────────────────┤
│ 1. Student Dashboard - Shows new course         │
│ 2. My Teachers - Shows new teacher              │
│ 3. Course Page - Shows "Unenroll" button        │
│ 4. Teacher's My Students - Shows new student    │
└──────────────────────────────────────────────────┘
```

## Database Schema

### Course Model Updates
```javascript
{
  enrolledStudents: [ObjectId],  // Students enrolled in this course
  teacher: ObjectId,              // Primary teacher (optional)
  // ... other fields
}
```

### User Model (Student)
```javascript
{
  enrolledTeachers: [ObjectId],  // Teachers student is enrolled with
  enrolledCourses: [ObjectId],   // Explicit course enrollments (optional)
  // ... other fields
}
```

### User Model (Teacher)
```javascript
{
  students: [ObjectId],           // Students enrolled with this teacher
  teachingCourses: [ObjectId],    // Courses this teacher teaches
  // ... other fields
}
```

## Testing Checklist

### ✅ Enrollment Scenarios
- [ ] Enroll in course with 0 teachers → Shows "No teachers" alert
- [ ] Enroll in course with 1 teacher → Auto-enrolls instantly
- [ ] Enroll in course with 2+ teachers → Shows selection dialog
- [ ] Select teacher from dialog → Enrolls successfully
- [ ] Unenroll from course → Removes from course only (keeps teacher)

### ✅ Dashboard Updates
- [ ] Student Dashboard shows new course after enrollment
- [ ] My Teachers shows new teacher after enrollment
- [ ] Teacher's My Students shows new student after enrollment
- [ ] Course Page button changes from "Enroll Now" to "Unenroll"

### ✅ Edge Cases
- [ ] Trying to enroll in full course → Shows "Course is full" error
- [ ] Trying to enroll with teacher not teaching course → Shows error
- [ ] Already enrolled → Shows "Unenroll" button
- [ ] Network error during enrollment → Shows error message

### ✅ UI/UX
- [ ] Loading spinner shows during enrollment
- [ ] Dialog has proper styling with pink accents
- [ ] Teacher cards are clickable and have hover effects
- [ ] Success/error messages are clear
- [ ] Buttons are disabled during loading

## Design Specifications

### Color Scheme
- **Primary Pink**: `#FF69B4` - Enroll button, dialog title, teacher selection
- **White Text**: On pink backgrounds
- **Pink Border**: For unenroll button (outline variant)

### Button States
```tsx
// Enrolled State
<Button
  variant="outline"
  style={{ borderColor: '#FF69B4', color: '#FF69B4' }}
>
  Unenroll
</Button>

// Not Enrolled State
<Button
  style={{ backgroundColor: '#FF69B4', color: 'white' }}
>
  Enroll Now
</Button>
```

### Dialog Design
- Max width: `sm:max-w-md`
- Max height for teacher list: `400px` with scroll
- Teacher cards: Hover scale effect (1.02x)
- Pink accent borders on hover
- Emoji avatars for teachers (👨‍🏫)

## Future Enhancements

1. **Bulk Enrollment**: Allow students to enroll in multiple courses at once
2. **Waitlist System**: Queue students when course is full
3. **Enrollment Notifications**: Email notifications on successful enrollment
4. **Course Recommendations**: Suggest courses based on enrolled teachers
5. **Enrollment Analytics**: Track enrollment trends and popular courses
6. **Teacher Preferences**: Allow students to set preferred teachers
7. **Automatic Unenrollment**: Remove from course when unenrolling from teacher

## Conclusion

This enrollment system provides a seamless, intelligent course enrollment experience that automatically manages teacher-student relationships while keeping all dashboards in sync. The three-tiered logic (no teachers / one teacher / multiple teachers) ensures the best UX for every scenario.
