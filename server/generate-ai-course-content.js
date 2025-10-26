const mongoose = require('mongoose');
const { Course } = require('./models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh';

// Groq API configuration - Use environment variables for security
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate detailed course content using AI
 */
async function generateLessonContent(lessonTitle, courseCategory, moduleName, lessonType = 'text') {
  try {
    const prompt = `You are an expert educator creating comprehensive lesson content for an online learning platform.

Course Category: ${courseCategory}
Module: ${moduleName}
Lesson Title: ${lessonTitle}
Lesson Type: ${lessonType}

Create detailed, educational content for this lesson following these requirements:

1. **Structure**: Use HTML formatting with proper headings (h1, h2, h3), paragraphs, lists, and code blocks
2. **Length**: Aim for 800-1200 words of comprehensive content
3. **Educational Value**: Include:
   - Clear introduction explaining the concept
   - Key learning objectives
   - Detailed explanations with examples
   - Code examples (if applicable) in <pre><code> tags
   - Visual descriptions or diagrams (describe them in text)
   - Common pitfalls and best practices
   - Real-world applications
   - Practice exercises or questions
   - Summary/key takeaways

4. **Formatting**: 
   - Use emojis sparingly for visual interest (📚, 🎯, 💡, ⚠️, etc.)
   - Use tables for comparisons when appropriate
   - Use bullet points and numbered lists
   - Include code examples with proper syntax highlighting hints

5. **Style**: 
   - Professional yet engaging tone
   - Clear and concise explanations
   - Progressive difficulty (start simple, build complexity)
   - Practical, actionable information

Generate ONLY the HTML content without any markdown code blocks or explanations. Start directly with the HTML.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator and technical writer specializing in creating comprehensive, engaging educational content for online courses. You create well-structured, detailed lessons with clear explanations, practical examples, and actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Clean up the content - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```html')) {
      cleanContent = cleanContent.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return cleanContent;
  } catch (error) {
    console.error(`❌ Error generating content for "${lessonTitle}":`, error.message);
    return null;
  }
}

/**
 * Add delay between API calls to respect rate limits
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAllCourseContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all courses
    const courses = await Course.find({ isActive: true, isPublished: true });
    console.log(`📚 Found ${courses.length} courses\n`);

    let totalLessonsProcessed = 0;
    let totalLessonsGenerated = 0;
    let totalLessonsSkipped = 0;

    for (const course of courses) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📖 Processing Course: ${course.name}`);
      console.log(`${'='.repeat(60)}`);

      if (!course.modules || course.modules.length === 0) {
        console.log('   ⏭️  No modules found, skipping...\n');
        continue;
      }

      let courseUpdated = false;

      for (const [moduleIdx, module] of course.modules.entries()) {
        console.log(`\n   📑 Module ${moduleIdx + 1}: ${module.title}`);

        if (!module.lessons || module.lessons.length === 0) {
          console.log('      ⏭️  No lessons found, skipping...');
          continue;
        }

        for (const [lessonIdx, lesson] of module.lessons.entries()) {
          totalLessonsProcessed++;

          console.log(`\n      📝 Lesson ${lessonIdx + 1}: ${lesson.title}`);

          // Check if lesson already has substantial content (more than 200 characters)
          if (lesson.content && lesson.content.length > 200) {
            console.log('         ✓ Already has content, skipping...');
            totalLessonsSkipped++;
            continue;
          }

          console.log('         🤖 Generating AI content...');

          // Generate content
          const generatedContent = await generateLessonContent(
            lesson.title,
            course.category,
            module.title,
            lesson.type || 'text'
          );

          if (generatedContent) {
            lesson.content = generatedContent;
            courseUpdated = true;
            totalLessonsGenerated++;
            console.log('         ✅ Content generated successfully!');
            console.log(`         📏 Length: ${generatedContent.length} characters`);
          } else {
            console.log('         ❌ Failed to generate content');
          }

          // Add delay to respect API rate limits (2 seconds between calls)
          await delay(2000);
        }
      }

      // Save course if it was updated
      if (courseUpdated) {
        await course.save();
        console.log(`\n   💾 Course saved with updated content`);
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 AI Content Generation Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total lessons processed: ${totalLessonsProcessed}`);
    console.log(`   Lessons generated: ${totalLessonsGenerated}`);
    console.log(`   Lessons skipped (already had content): ${totalLessonsSkipped}`);
    console.log(`   Success rate: ${totalLessonsProcessed > 0 ? Math.round((totalLessonsGenerated / totalLessonsProcessed) * 100) : 0}%`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
console.log('🚀 AI Course Content Generator');
console.log('🤖 Using Groq API with Llama 3.3 70B Model\n');

generateAllCourseContent();