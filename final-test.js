// Final test to check user data
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function finalTest() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to ${conn.connection.name}`);
    
    // Import User model
    const User = require('./server/models/User');
    
    // Test a simple query with timeout
    console.log('Querying users...');
    const users = await User.find().limit(5).select('name email role googleId firebaseId enrolledTeachers students enrolledCourses teachingCourses');
    console.log(`Found ${users.length} users`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Google ID: ${user.googleId ? 'Yes' : 'No'}`);
      console.log(`  Firebase ID: ${user.firebaseId ? 'Yes' : 'No'}`);
      console.log(`  Enrolled Teachers: ${user.enrolledTeachers ? user.enrolledTeachers.length : 0}`);
      console.log(`  Students: ${user.students ? user.students.length : 0}`);
      console.log(`  Enrolled Courses: ${user.enrolledCourses ? user.enrolledCourses.length : 0}`);
      console.log(`  Teaching Courses: ${user.teachingCourses ? user.teachingCourses.length : 0}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Set a timeout to prevent hanging
setTimeout(() => {
  console.log('Test timed out');
  process.exit(1);
}, 10000);

finalTest();