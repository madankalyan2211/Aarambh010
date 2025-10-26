# My Teachers Feature

## Overview
The "My Teachers" page allows students to view all teachers whose courses they are enrolled in, and filter assignments and courses by specific teachers.

## Features

### 1. **Teacher Overview**
- View all teachers from enrolled courses
- See number of courses and assignments per teacher
- Teacher contact information (email)

### 2. **Teacher Selection**
- Click on any teacher to view detailed information
- Visual indicator (checkmark) shows selected teacher
- Highlighted card with pink border for selected teacher

### 3. **Teacher Details Panel**
When a teacher is selected, students can see:

#### **Teacher Information Card**
- Teacher's name and email
- Total number of courses taught (that student is enrolled in)
- Total number of active assignments

#### **Courses Section**
- All courses taught by that teacher (that student is enrolled in)
- Course description
- Click to navigate to course page

#### **Assignments Section**
- All active assignments from that teacher
- Assignment title, due date, and posted date
- Course association
- Urgency indicators (Urgent badge for deadlines)
- Click to navigate to assignment page

## Navigation

The "My Teachers" tab is now available in the student navigation bar:
- 🏠 Dashboard
- 👨‍🏫 **My Teachers** ← NEW!
- 📚 Courses
- 📝 Assignments
- 🏆 Grades
- 💬 Discussion

## How It Works

### Data Filtering Logic

1. **Get Student's Enrolled Courses**
   ```typescript
   const enrolledCourses = getStudentCourses(userEmail);
   ```

2. **Extract Unique Teachers**
   - From enrolled courses, get all unique teachers
   - Filter duplicates (same teacher teaching multiple courses)

3. **Teacher Selection**
   - When teacher is selected, filter courses and assignments
   - Show only courses the student is enrolled in
   - Show only assignments from those courses

### Example Scenario

**Student: john.doe@student.aarambh.edu**

**Enrolled Courses:**
- AI & Machine Learning (Dr. Sarah Chen)
- Web Development (Prof. Michael Ross)

**My Teachers Page Shows:**

**Left Panel (Teachers List):**
```
┌─────────────────────────────────┐
│ 👨‍🏫 Dr. Sarah Chen             │
│ sarah.chen@aarambh.edu          │
│ • 1 Course • 1 Assignment       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 👨‍🏫 Prof. Michael Ross         │
│ michael.ross@aarambh.edu        │
│ • 1 Course • 1 Assignment       │
└─────────────────────────────────┘
```

**Right Panel (When Dr. Sarah Chen is selected):**
```
┌─────────────────────────────────┐
│ Teacher Info                     │
│ Dr. Sarah Chen                   │
│ sarah.chen@aarambh.edu          │
│ 1 Course | 1 Assignment         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Courses (1)                      │
│ • AI & Machine Learning          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Active Assignments (1)           │
│ • AI Assignment #4               │
│   Due: Tomorrow (Urgent)         │
└─────────────────────────────────┘
```

## Visual Design

### Design Elements
✅ **Blue accent color** (#3B82F6) for selected teacher border
✅ **Black text in light mode**, white text in dark mode
✅ **Smooth animations** with motion/react
✅ **Gradient backgrounds** for teacher info cards
✅ **Hover effects** on interactive elements
✅ **Badge indicators** for urgent assignments

### Layout
- **Responsive grid**: 1 column on mobile, 3 columns on desktop
- **Left sidebar**: Teachers list (1/3 width)
- **Right panel**: Teacher details (2/3 width)
- **Cards**: Elevated with shadows and hover effects

## User Interactions

1. **Click on Teacher Card**
   - Highlights card with blue border
   - Shows checkmark icon
   - Displays teacher details in right panel

2. **Click on Course Card**
   - Navigates to Courses page

3. **Click on Assignment**
   - Navigates to Assignments page

4. **Deselect Teacher**
   - Click on selected teacher again to deselect
   - Right panel shows empty state

## Empty States

### No Teachers
```
You're not enrolled in any courses yet.
[Browse Courses Button]
```

### No Teacher Selected
```
Select a Teacher
Click on a teacher from the list to view 
their courses and assignments
```

### No Assignments
```
🎉 No active assignments from this teacher
```

## File Structure

```
src/
├── components/
│   ├── MyTeachersPage.tsx      ← NEW! My Teachers page component
│   ├── Navigation.tsx           ← Updated with "My Teachers" tab
│   └── ...
├── data/
│   └── mockData.ts              ← Data source for teachers/courses
└── App.tsx                       ← Added 'my-teachers' route
```

## Technical Implementation

### Component Props
```typescript
interface MyTeachersPageProps {
  onNavigate: (page: Page) => void;
  userEmail: string; // Used to filter student's data
}
```

### Key State
```typescript
const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
```

### Data Fetching
- Uses `getStudentCourses(userEmail)` to get enrolled courses
- Uses `getTeacherById(id)` to get teacher details
- Filters assignments by teacher and enrolled courses

## Benefits

✅ **Clear Teacher Attribution**: Students know exactly which teacher assigned what
✅ **Easy Filtering**: View specific teacher's content at a glance
✅ **Better Organization**: Assignments and courses grouped by teacher
✅ **Contact Information**: Quick access to teacher emails
✅ **Visual Clarity**: Clean, organized interface with blue accents
✅ **Responsive Design**: Works on all devices

## Future Enhancements

- [ ] Add teacher profiles with bio and office hours
- [ ] Teacher messaging system
- [ ] Filter by multiple teachers simultaneously
- [ ] Search/sort teachers by name
- [ ] Show teacher ratings/reviews
- [ ] Add calendar view of teacher's assignments
