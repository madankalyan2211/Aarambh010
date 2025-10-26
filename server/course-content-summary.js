const mongoose = require('mongoose');
const { Course } = require('./models');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh';

async function showCourseContentSummary() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    
    console.log(`📚 Found ${courses.length} active courses\n`);
    console.log('=' .repeat(80));
    
    let totalModules = 0;
    let totalLessons = 0;
    let totalLessonsWithContent = 0;
    
    for (const course of courses) {
      console.log(`\n📖 ${course.name}`);
      console.log(`   Category: ${course.category || 'General'}`);
      console.log(`   Published: ${course.isPublished ? 'Yes' : 'No'}`);
      console.log(`   Students: ${course.enrolledStudents?.length || 0}`);
      
      const moduleCount = course.modules?.length || 0;
      console.log(`   Modules: ${moduleCount}`);
      
      let lessonCount = 0;
      let lessonsWithContent = 0;
      
      if (course.modules) {
        for (const module of course.modules) {
          if (module.lessons) {
            lessonCount += module.lessons.length;
            for (const lesson of module.lessons) {
              if (lesson.content && lesson.content.length > 0) {
                lessonsWithContent++;
              }
            }
          }
        }
      }
      
      console.log(`   Lessons: ${lessonCount}`);
      console.log(`   Lessons with content: ${lessonsWithContent}`);
      if (lessonCount > 0) {
        const completion = ((lessonsWithContent / lessonCount) * 100).toFixed(1);
        console.log(`   Content completion: ${completion}%`);
      } else {
        console.log(`   Content completion: 0%`);
      }
      
      totalModules += moduleCount;
      totalLessons += lessonCount;
      totalLessonsWithContent += lessonsWithContent;
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 OVERALL SUMMARY');
    console.log('=' .repeat(80));
    console.log(`Courses: ${courses.length}`);
    console.log(`Total modules: ${totalModules}`);
    console.log(`Total lessons: ${totalLessons}`);
    console.log(`Lessons with content: ${totalLessonsWithContent}`);
    
    if (totalLessons > 0) {
      const overallCompletion = ((totalLessonsWithContent / totalLessons) * 100).toFixed(1);
      console.log(`Overall content completion: ${overallCompletion}%`);
    }
    
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the summary
showCourseContentSummary();