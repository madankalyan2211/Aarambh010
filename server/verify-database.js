const mongoose = require('mongoose');
require('dotenv').config();

const {
  User,
  Course,
  Assignment,
  Submission,
  Discussion,
  Notification,
  Attendance,
  Grade,
  Announcement,
} = require('./models');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying Aarambh LMS Database');
    console.log('═'.repeat(80));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get collection counts
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const courseCount = await Course.countDocuments();
    const assignmentCount = await Assignment.countDocuments();
    const submissionCount = await Submission.countDocuments();
    const discussionCount = await Discussion.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const gradeCount = await Grade.countDocuments();
    const announcementCount = await Announcement.countDocuments();
    
    console.log('📊 DATABASE SUMMARY\n');
    console.log('Users Collection:');
    console.log(`   Total Users: ${userCount}`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Teachers: ${teacherCount}`);
    console.log(`   - Students: ${studentCount}\n`);
    
    console.log('Course Collections:');
    console.log(`   Courses: ${courseCount}`);
    console.log(`   Assignments: ${assignmentCount}`);
    console.log(`   Discussions: ${discussionCount}\n`);
    
    console.log('Student Work Collections:');
    console.log(`   Submissions: ${submissionCount}`);
    console.log(`   Grades: ${gradeCount}`);
    console.log(`   Attendance Records: ${attendanceCount}\n`);
    
    console.log('Communication Collections:');
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Announcements: ${announcementCount}\n`);
    
    console.log('═'.repeat(80));
    
    // Show course details
    console.log('\n📚 COURSES CREATED:\n');
    const courses = await Course.find().populate('teacher', 'name email');
    
    for (const course of courses) {
      console.log(`${course.name}`);
      console.log(`   Teacher: ${course.teacher.name} (${course.teacher.email})`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Difficulty: ${course.difficulty}`);
      console.log(`   Enrolled Students: ${course.enrolledStudents.length}`);
      console.log(`   Published: ${course.isPublished ? '✅' : '❌'}`);
      console.log(`   Modules: ${course.modules.length}\n`);
    }
    
    // Show assignments
    console.log('═'.repeat(80));
    console.log('\n📝 ASSIGNMENTS CREATED:\n');
    const assignments = await Assignment.find().populate('teacher', 'name').populate('course', 'name');
    
    for (const assignment of assignments) {
      console.log(`${assignment.title}`);
      console.log(`   Course: ${assignment.course.name}`);
      console.log(`   Teacher: ${assignment.teacher.name}`);
      console.log(`   Due Date: ${assignment.dueDate.toLocaleDateString()}`);
      console.log(`   Points: ${assignment.totalPoints}`);
      console.log(`   Published: ${assignment.isPublished ? '✅' : '❌'}\n`);
    }
    
    // Show announcements
    console.log('═'.repeat(80));
    console.log('\n📢 ANNOUNCEMENTS:\n');
    const announcements = await Announcement.find().populate('author', 'name role');
    
    for (const announcement of announcements) {
      console.log(`${announcement.title}`);
      console.log(`   Author: ${announcement.author.name} (${announcement.author.role})`);
      console.log(`   Target: ${announcement.targetAudience}`);
      console.log(`   Priority: ${announcement.priority}`);
      console.log(`   Pinned: ${announcement.isPinned ? '✅' : '❌'}\n`);
    }
    
    console.log('═'.repeat(80));
    console.log('\n✅ DATABASE VERIFICATION COMPLETE!\n');
    
    console.log('🔐 TEST CREDENTIALS:\n');
    console.log('Admin:');
    console.log('   Email: admin@aarambh.edu');
    console.log('   Password: admin123\n');
    console.log('Teacher:');
    console.log('   Email: sarah.johnson@aarambh.edu');
    console.log('   Password: teacher123\n');
    console.log('Student:');
    console.log('   Email: alice.williams@student.aarambh.edu');
    console.log('   Password: student123\n');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
