const mongoose = require('mongoose');
const { Course } = require('./models');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh';

async function verifyCourseContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a specific course to verify
    const course = await Course.findOne({ name: "Introduction to Web Development" });
    
    if (!course) {
      console.log("Course not found");
      return;
    }

    console.log(`📚 Course: ${course.name}`);
    console.log(`📊 Modules: ${course.modules.length}`);
    
    // Check the first module and lesson
    if (course.modules.length > 0) {
      const firstModule = course.modules[0];
      console.log(`\n   📑 Module: ${firstModule.title}`);
      console.log(`   📝 Description: ${firstModule.description}`);
      console.log(`   📚 Lessons: ${firstModule.lessons.length}`);
      
      if (firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0];
        console.log(`\n      📝 Lesson: ${firstLesson.title}`);
        console.log(`      ⏱️ Duration: ${firstLesson.duration} minutes`);
        console.log(`      📄 Content length: ${firstLesson.content ? firstLesson.content.length : 0} characters`);
        
        // Show a snippet of the content
        if (firstLesson.content) {
          const snippet = firstLesson.content.substring(0, 200);
          console.log(`\n      📖 Content snippet:\n      ${snippet}...`);
        }
      }
    }

    // Count total lessons with content
    let lessonsWithContent = 0;
    let totalLessons = 0;
    
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        totalLessons++;
        if (lesson.content && lesson.content.length > 0) {
          lessonsWithContent++;
        }
      }
    }
    
    console.log(`\n📈 Course Statistics:`);
    console.log(`   Total lessons: ${totalLessons}`);
    console.log(`   Lessons with content: ${lessonsWithContent}`);
    console.log(`   Completion rate: ${((lessonsWithContent/totalLessons)*100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the verification
verifyCourseContent();