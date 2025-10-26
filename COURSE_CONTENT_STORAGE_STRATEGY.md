# Course Content Storage Strategy

## 🎯 Problem: Should Course Content Be Stored in MongoDB?

**TL;DR:** Use a **hybrid approach** - store lightweight content in MongoDB, reference heavy files externally.

---

## ❌ What NOT to Store in MongoDB

### 1. **Large Video Files**
- **Size:** Videos can be 100MB - 5GB+
- **Problem:** MongoDB document limit is 16MB
- **Solution:** Use YouTube, Vimeo, or cloud storage (AWS S3, Cloudinary)

### 2. **Large PDF Files**
- **Size:** Course materials can be 10-50MB each
- **Problem:** Slows down queries, increases costs
- **Solution:** Store in cloud storage, save URL in MongoDB

### 3. **Images**
- **Size:** High-res images can be 2-10MB
- **Problem:** Unnecessary database bloat
- **Solution:** Use CDN (Cloudinary, AWS CloudFront)

### 4. **Binary Files**
- **Size:** Varies greatly
- **Problem:** Not searchable, inefficient storage
- **Solution:** Blob storage (AWS S3, Azure Blob)

---

## ✅ What TO Store in MongoDB

### 1. **Course Structure**
```javascript
{
  name: "Web Development 101",
  description: "Learn HTML, CSS, JS",
  category: "Programming",
  difficulty: "Beginner",
  // Small, frequently queried data
}
```

### 2. **Module/Lesson Metadata**
```javascript
modules: [{
  title: "Introduction to HTML",
  description: "Learn HTML basics",
  order: 1,
  duration: 120, // minutes
}]
```

### 3. **Lesson Text Content** (if < 10KB)
```javascript
lessons: [{
  title: "HTML Basics",
  content: "# HTML Basics\n\nHTML stands for...", // Markdown text
  type: "text",
  duration: 15
}]
```

### 4. **External Resource Links**
```javascript
lessons: [{
  title: "Video Tutorial",
  videoUrl: "https://youtube.com/watch?v=abc123",
  pdfUrl: "https://s3.amazonaws.com/course-materials/lesson1.pdf",
  slides: "https://cdn.example.com/slides.pdf"
}]
```

---

## 🏗️ Recommended MongoDB Schema

```javascript
const courseSchema = new mongoose.Schema({
  // Basic Info (Always in DB)
  name: String,
  description: String,
  category: String,
  difficulty: String,
  tags: [String],
  
  // Course Structure
  modules: [{
    title: String,
    description: String,
    order: Number,
    
    lessons: [{
      title: String,
      order: Number,
      duration: Number, // in minutes
      
      // Content Type
      type: {
        type: String,
        enum: ['text', 'video', 'pdf', 'quiz', 'interactive']
      },
      
      // Lightweight Text Content (< 10KB)
      content: {
        type: String,
        maxlength: 10000, // Limit to 10KB
      },
      
      // External Resource URLs
      videoUrl: String,        // YouTube/Vimeo
      pdfUrl: String,          // S3/Cloud Storage
      slidesUrl: String,       // Presentation files
      codeRepositoryUrl: String, // GitHub repo
      
      // Attachments (just metadata)
      attachments: [{
        name: String,
        type: String,          // 'pdf', 'doc', 'zip', etc.
        url: String,           // External storage URL
        size: Number,          // File size in bytes
      }],
      
      // Interactive Elements
      quiz: {
        questions: [{
          question: String,
          options: [String],
          correctAnswer: Number,
        }]
      },
      
      // Completion tracking
      isPreview: Boolean,      // Free preview?
      isRequired: Boolean,     // Required for completion?
    }]
  }],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
});
```

---

## 📊 Storage Size Comparison

### Bad Approach (Everything in MongoDB)
```
Course with 10 video lessons:
- 10 videos × 200MB = 2GB
- Total DB size: ~2GB per course
- 100 courses = 200GB database
- Cost: $$$$$ (MongoDB Atlas pricing scales with storage)
```

### Good Approach (Hybrid)
```
Course with 10 video lessons:
- Metadata + structure: ~50KB
- Text content: ~100KB
- Total DB size: 150KB per course
- 100 courses = 15MB database
- Videos stored in S3: ~$0.023/GB/month
- Cost: $ (much cheaper)
```

---

## 💡 Implementation Strategy

### For This LMS Project:

#### Phase 1: MongoDB (Current)
Store:
- ✅ Course metadata
- ✅ Module structure
- ✅ Lesson titles and descriptions
- ✅ **Markdown text content** (< 10KB per lesson)
- ✅ External URLs for videos/PDFs

#### Phase 2: Cloud Storage (Future)
When you need file uploads:
- Use **AWS S3** or **Cloudinary** for video storage
- Use **CDN** for images and PDFs
- Generate signed URLs for secure access
- Track URLs in MongoDB

#### Phase 3: Advanced (Optional)
- Video streaming with **HLS/DASH**
- Progressive file uploads
- Content delivery network (CDN)
- Video transcoding

---

## 🔧 Practical Implementation

### 1. Create Sample Course with Content

```javascript
// server/seed-course-content.js
const sampleCourse = {
  name: "Introduction to Web Development",
  description: "Learn HTML, CSS, and JavaScript",
  category: "Programming",
  difficulty: "Beginner",
  modules: [
    {
      title: "HTML Basics",
      description: "Learn HTML structure and elements",
      order: 1,
      lessons: [
        {
          title: "What is HTML?",
          order: 1,
          duration: 15,
          type: "text",
          content: `# What is HTML?

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## Key Points:
- HTML describes the structure of web pages
- HTML elements are represented by tags
- Browsers use HTML to display content

## Basic Structure:
\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
\`\`\``,
          isPreview: true,
        },
        {
          title: "HTML Video Tutorial",
          order: 2,
          duration: 20,
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
          content: "Watch this comprehensive video tutorial on HTML basics.",
        },
        {
          title: "HTML Cheat Sheet",
          order: 3,
          duration: 5,
          type: "pdf",
          pdfUrl: "https://htmlcheatsheet.com/html5-cheat-sheet.pdf",
          content: "Download and reference this HTML cheat sheet.",
        },
      ],
    },
  ],
};
```

### 2. Backend API for Course Content

```javascript
// server/controllers/courseController.js

exports.getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .select('name description category difficulty modules');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Return full course with modules and lessons
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course content',
      error: error.message,
    });
  }
};
```

### 3. Frontend - Display Course Content

```typescript
// src/components/CourseContentPage.tsx
import ReactMarkdown from 'react-markdown';

const CourseContentPage = ({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);
  
  const fetchCourseContent = async () => {
    const response = await getCourseContentAPI(courseId);
    if (response.success) {
      setCourse(response.data);
      // Auto-select first lesson
      if (response.data.modules[0]?.lessons[0]) {
        setSelectedLesson(response.data.modules[0].lessons[0]);
      }
    }
  };
  
  const renderLessonContent = () => {
    if (!selectedLesson) return null;
    
    switch (selectedLesson.type) {
      case 'text':
        return <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>;
        
      case 'video':
        return (
          <div>
            <iframe
              src={selectedLesson.videoUrl}
              className="w-full aspect-video"
              allowFullScreen
            />
            <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
          </div>
        );
        
      case 'pdf':
        return (
          <div>
            <a href={selectedLesson.pdfUrl} download>
              Download PDF
            </a>
            <iframe src={selectedLesson.pdfUrl} className="w-full h-96" />
          </div>
        );
        
      default:
        return <p>{selectedLesson.content}</p>;
    }
  };
  
  return (
    <div className="flex">
      {/* Sidebar - Module List */}
      <div className="w-1/4">
        {course?.modules.map(module => (
          <div key={module._id}>
            <h3>{module.title}</h3>
            {module.lessons.map(lesson => (
              <button
                key={lesson._id}
                onClick={() => setSelectedLesson(lesson)}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      
      {/* Main Content Area */}
      <div className="w-3/4">
        <h1>{selectedLesson?.title}</h1>
        {renderLessonContent()}
      </div>
    </div>
  );
};
```

---

## 📈 Storage Costs Estimate

### MongoDB Atlas (for metadata only)
- **M0 Cluster (Free):** 512MB storage - Good for 3,000+ courses with our approach
- **M10 Cluster ($57/month):** 10GB storage - Good for 60,000+ courses
- **Scalable:** Pay only for what you use

### AWS S3 (for videos/files)
- **Storage:** $0.023/GB/month
- **100GB of videos:** ~$2.30/month
- **1TB of videos:** ~$23/month
- **Transfer:** First 100GB/month free

### Cloudinary (alternative)
- **Free tier:** 25GB storage, 25GB bandwidth
- **Plus ($99/month):** 100GB storage, 100GB bandwidth

### Total Cost for 100 Courses:
- **MongoDB:** Free (M0) or $57/month (M10)
- **S3 Storage:** ~$10-20/month
- **Total:** ~$10-77/month (vs $500+ if all in MongoDB)

---

## ✅ Best Practices

### 1. **Content Size Limits**
```javascript
// Validate before saving
if (content.length > 10000) {
  // Content too large, suggest external storage
  return res.status(400).json({
    message: 'Text content exceeds 10KB. Please use external storage.'
  });
}
```

### 2. **Lazy Loading**
```javascript
// Don't load all modules at once
// Load module details on demand
exports.getModuleContent = async (req, res) => {
  const { courseId, moduleId } = req.params;
  const module = await Course.findOne(
    { _id: courseId, 'modules._id': moduleId },
    { 'modules.$': 1 }
  );
  res.json({ data: module.modules[0] });
};
```

### 3. **Caching**
```javascript
// Cache frequently accessed content
const cachedCourse = await redis.get(`course:${courseId}`);
if (cachedCourse) {
  return res.json(JSON.parse(cachedCourse));
}
```

### 4. **Content Compression**
```javascript
// Compress large text before storing
const compressed = zlib.gzipSync(content);
lesson.content = compressed.toString('base64');
lesson.isCompressed = true;
```

---

## 🎯 Recommendation for Your LMS

### Immediate Implementation:
1. ✅ Store course structure in MongoDB
2. ✅ Store markdown text content (< 10KB) in MongoDB
3. ✅ Use YouTube embed links for videos
4. ✅ Use public URLs for PDFs (Google Drive, Dropbox)

### Future Enhancements:
1. Implement AWS S3 for private file storage
2. Add video upload/transcoding
3. Implement CDN for faster content delivery
4. Add content encryption for premium courses

---

## 📝 Summary

**Use MongoDB for:**
- ✅ Course metadata
- ✅ Module/lesson structure
- ✅ Short text content (<10KB)
- ✅ External URLs

**Don't use MongoDB for:**
- ❌ Videos
- ❌ Large PDFs
- ❌ Images
- ❌ Binary files

**Result:**
- 💰 Save 95% on storage costs
- ⚡ Faster queries
- 📈 Better scalability
- 🎯 Professional architecture

This approach is used by platforms like Udemy, Coursera, and Khan Academy!
