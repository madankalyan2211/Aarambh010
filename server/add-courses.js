const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/database');

dotenv.config();

const courses = [
  {  name: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    category: 'Computer Science',
    difficulty: 'Beginner',
    isPublished: true,
    isActive: true,
    maxStudents: 50,
    tags: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
  },
  {
    name: 'Data Structures and Algorithms',
    description: 'Master essential data structures and algorithmic thinking for efficient programming.',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    isPublished: true,
    isActive: true,
    maxStudents: 40,
    tags: ['Algorithms', 'Data Structures', 'Programming'],
  },
  {
    name: 'Database Management Systems',
    description: 'Explore relational databases, SQL, and database design principles.',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    isPublished: true,
    isActive: true,
    maxStudents: 45,
    tags: ['SQL', 'Database', 'MySQL', 'MongoDB'],
  },
  {
    name: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning algorithms, neural networks, and AI applications.',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    isPublished: true,
    isActive: true,
    maxStudents: 30,
    tags: ['AI', 'Machine Learning', 'Python', 'Neural Networks'],
  },
  {
    name: 'Mobile App Development',
    description: 'Build cross-platform mobile applications using React Native and Flutter.',
    category: 'Mobile Development',
    difficulty: 'Intermediate',
    isPublished: true,
    isActive: true,
    maxStudents: 35,
    tags: ['React Native', 'Flutter', 'Mobile', 'iOS', 'Android'],
  },
  {
    name: 'Cloud Computing with AWS',
    description: 'Learn cloud infrastructure, serverless computing, and AWS services.',
    category: 'Cloud Computing',
    difficulty: 'Advanced',
    isPublished: true,
    isActive: true,
    maxStudents: 30,
    tags: ['AWS', 'Cloud', 'Serverless', 'Infrastructure'],
  },
  {
    name: 'Cybersecurity Essentials',
    description: 'Understand network security, encryption, and ethical hacking fundamentals.',
    category: 'Security',
    difficulty: 'Intermediate',
    isPublished: true,
    isActive: true,
    maxStudents: 40,
    tags: ['Security', 'Hacking', 'Encryption', 'Network Security'],
  },
  {
    name: 'UI/UX Design Principles',
    description: 'Master user interface design, user experience, and design thinking.',
    category: 'Design',
    difficulty: 'Beginner',
    isPublished: true,
    isActive: true,
    maxStudents: 50,
    tags: ['UI', 'UX', 'Design', 'Figma', 'Adobe XD'],
  },
  {
    name: 'Python Programming',
    description: 'Learn Python from basics to advanced concepts including OOP and libraries.',
    category: 'Computer Science',
    difficulty: 'Beginner',
    isPublished: true,
    isActive: true,
    maxStudents: 60,
    tags: ['Python', 'Programming', 'OOP', 'Libraries'],
  },
  {
    name: 'DevOps and CI/CD',
    description: 'Implement DevOps practices, Docker, Kubernetes, and automated deployments.',
    category: 'Operations',
    difficulty: 'Advanced',
    isPublished: true,
    isActive: true,
    maxStudents: 25,
    tags: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'Automation'],
  },
];

async function addCourses() {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing courses...');
    await Course.deleteMany({});
    
    console.log('📚 Adding 10 courses to database...');
    const createdCourses = await Course.insertMany(courses);
    
    console.log('✅ Successfully added courses:');
    createdCourses.forEach(course => {
      console.log(`   - ${course.name} (${course.difficulty}) - ${course.category}`);
    });
    
    console.log('\n📊 Total courses:', createdCourses.length);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding courses:', error);
    process.exit(1);
  }
}

addCourses();
