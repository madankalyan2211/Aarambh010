// Simple test to check if there are Google signed-in users
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Test function
const runTest = async () => {
  const connection = await connectDB();
  
  // Import User model
  const User = require('./server/models/User');
  
  try {
    // Count users with Google ID
    const googleUserCount = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
    console.log(`\n🔍 Found ${googleUserCount} Google signed-in users`);
    
    // Count users with Firebase ID
    const firebaseUserCount = await User.countDocuments({ firebaseId: { $exists: true, $ne: null } });
    console.log(`\n🔍 Found ${firebaseUserCount} Firebase signed-in users`);
    
    // Show sample users
    if (googleUserCount > 0) {
      console.log('\n--- Sample Google Users ---');
      const sampleGoogleUsers = await User.find({ googleId: { $exists: true, $ne: null } })
        .limit(3)
        .select('name email role googleId isVerified enrolledTeachers students enrolledCourses teachingCourses');
      sampleGoogleUsers.forEach(user => {
        console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.isVerified}`);
        console.log(`  Enrolled Teachers: ${user.enrolledTeachers ? user.enrolledTeachers.length : 0}`);
        console.log(`  Students: ${user.students ? user.students.length : 0}`);
        console.log(`  Enrolled Courses: ${user.enrolledCourses ? user.enrolledCourses.length : 0}`);
        console.log(`  Teaching Courses: ${user.teachingCourses ? user.teachingCourses.length : 0}`);
      });
    }
    
    if (firebaseUserCount > 0) {
      console.log('\n--- Sample Firebase Users ---');
      const sampleFirebaseUsers = await User.find({ firebaseId: { $exists: true, $ne: null } })
        .limit(3)
        .select('name email role firebaseId isVerified enrolledTeachers students enrolledCourses teachingCourses');
      sampleFirebaseUsers.forEach(user => {
        console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.isVerified}`);
        console.log(`  Enrolled Teachers: ${user.enrolledTeachers ? user.enrolledTeachers.length : 0}`);
        console.log(`  Students: ${user.students ? user.students.length : 0}`);
        console.log(`  Enrolled Courses: ${user.enrolledCourses ? user.enrolledCourses.length : 0}`);
        console.log(`  Teaching Courses: ${user.teachingCourses ? user.teachingCourses.length : 0}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 MongoDB connection closed');
  }
};

runTest();