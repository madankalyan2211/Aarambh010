// Simple test to check user data
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function simpleCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./server/models/User');
    const user = await User.findOne().select('name email role enrolledTeachers students enrolledCourses teachingCourses');
    if (user) {
      console.log('User:', user.name);
      console.log('Enrolled Teachers:', Array.isArray(user.enrolledTeachers));
      console.log('Students:', Array.isArray(user.students));
      console.log('Enrolled Courses:', Array.isArray(user.enrolledCourses));
      console.log('Teaching Courses:', Array.isArray(user.teachingCourses));
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleCheck();