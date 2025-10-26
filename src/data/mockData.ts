// Mock data structure for teacher-student-course relationships

export interface Teacher {
  id: string;
  name: string;
  email: string;
  courses: string[]; // course IDs
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[]; // course IDs
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  description: string;
  image: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  teacherId: string;
  dueDate: string;
  daysLeft: number;
  urgent: boolean;
  description: string;
  createdAt: string;
}

// Mock Teachers
export const teachers: Teacher[] = [
  {
    id: 'T001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@aarambh.edu',
    courses: ['C001', 'C004'],
  },
  {
    id: 'T002',
    name: 'Prof. Michael Ross',
    email: 'michael.ross@aarambh.edu',
    courses: ['C002'],
  },
  {
    id: 'T003',
    name: 'Dr. Emma Wilson',
    email: 'emma.wilson@aarambh.edu',
    courses: ['C003'],
  },
];

// Mock Courses
export const courses: Course[] = [
  {
    id: 'C001',
    name: 'AI & Machine Learning',
    teacherId: 'T001',
    description: 'Master the fundamentals of artificial intelligence',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400',
  },
  {
    id: 'C002',
    name: 'Web Development',
    teacherId: 'T002',
    description: 'Build modern web applications from scratch',
    image: 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?w=400',
  },
  {
    id: 'C003',
    name: 'Digital Marketing',
    teacherId: 'T003',
    description: 'Learn to create winning marketing campaigns',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
  },
  {
    id: 'C004',
    name: 'Neural Networks Advanced',
    teacherId: 'T001',
    description: 'Deep dive into neural network architectures',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
  },
];

// Mock Students
export const students: Student[] = [
  {
    id: 'S001',
    name: 'John Doe',
    email: 'john.doe@student.aarambh.edu',
    enrolledCourses: ['C001', 'C002'], // Enrolled in Dr. Chen's AI and Prof. Ross's Web Dev
  },
  {
    id: 'S002',
    name: 'Jane Smith',
    email: 'jane.smith@student.aarambh.edu',
    enrolledCourses: ['C001', 'C003'], // Enrolled in Dr. Chen's AI and Dr. Wilson's Marketing
  },
  {
    id: 'S003',
    name: 'Bob Wilson',
    email: 'bob.wilson@student.aarambh.edu',
    enrolledCourses: ['C002', 'C003'], // Enrolled in Prof. Ross's Web Dev and Dr. Wilson's Marketing
  },
  {
    id: 'S004',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.aarambh.edu',
    enrolledCourses: ['C001', 'C002', 'C003'], // Enrolled in all three courses
  },
];

// Mock Assignments
export const assignments: Assignment[] = [
  {
    id: 'A001',
    title: 'AI Assignment #4',
    courseId: 'C001',
    teacherId: 'T001',
    dueDate: 'Tomorrow',
    daysLeft: 1,
    urgent: true,
    description: 'Complete neural network implementation',
    createdAt: '2024-01-10',
  },
  {
    id: 'A002',
    title: 'Web Dev Project',
    courseId: 'C002',
    teacherId: 'T002',
    dueDate: 'In 3 days',
    daysLeft: 3,
    urgent: false,
    description: 'Build a responsive React application',
    createdAt: '2024-01-08',
  },
  {
    id: 'A003',
    title: 'Marketing Quiz',
    courseId: 'C003',
    teacherId: 'T003',
    dueDate: 'Next week',
    daysLeft: 7,
    urgent: false,
    description: 'SEO and content marketing strategies',
    createdAt: '2024-01-05',
  },
  {
    id: 'A004',
    title: 'Deep Learning Essay',
    courseId: 'C004',
    teacherId: 'T001',
    dueDate: 'In 5 days',
    daysLeft: 5,
    urgent: false,
    description: 'Write about CNN architectures',
    createdAt: '2024-01-07',
  },
];

// Helper function to get student's assignments based on their enrolled courses
export function getStudentAssignments(studentEmail: string): Assignment[] {
  const student = students.find(s => s.email === studentEmail);
  if (!student) return [];

  // Filter assignments to only show those from courses the student is enrolled in
  return assignments.filter(assignment => 
    student.enrolledCourses.includes(assignment.courseId)
  ).sort((a, b) => a.daysLeft - b.daysLeft);
}

// Helper function to get course by ID
export function getCourseById(courseId: string): Course | undefined {
  return courses.find(c => c.id === courseId);
}

// Helper function to get teacher by ID
export function getTeacherById(teacherId: string): Teacher | undefined {
  return teachers.find(t => t.id === teacherId);
}

// Helper function to get student's enrolled courses with details
export function getStudentCourses(studentEmail: string) {
  const student = students.find(s => s.email === studentEmail);
  if (!student) return [];

  return student.enrolledCourses.map(courseId => {
    const course = getCourseById(courseId);
    const teacher = course ? getTeacherById(course.teacherId) : undefined;
    return {
      ...course,
      teacherName: teacher?.name || 'Unknown',
    };
  }).filter(Boolean);
}

// Helper function to get assignments for a specific teacher
export function getTeacherAssignments(teacherEmail: string): Assignment[] {
  const teacher = teachers.find(t => t.email === teacherEmail);
  if (!teacher) return [];

  return assignments.filter(assignment => assignment.teacherId === teacher.id);
}

// Helper function to get students enrolled in a teacher's courses
export function getTeacherStudents(teacherEmail: string): Student[] {
  const teacher = teachers.find(t => t.email === teacherEmail);
  if (!teacher) return [];

  return students.filter(student =>
    student.enrolledCourses.some(courseId => teacher.courses.includes(courseId))
  );
}
