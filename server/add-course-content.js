const mongoose = require('mongoose');
const { Course } = require('./models');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh';

// Course content data - Following hybrid storage strategy
const coursesContent = [
  {
    name: 'Introduction to Web Development',
    modules: [
      {
        title: 'HTML Fundamentals',
        description: 'Master the building blocks of the web',
        order: 1,
        lessons: [
          {
            title: 'Introduction to HTML',
            type: 'text',
            duration: 15,
            order: 1,
            isPreview: true,
            content: `<h1>Introduction to HTML</h1>
<p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>

<h2>📚 What You'll Learn</h2>
<ul>
  <li>Basic HTML structure and syntax</li>
  <li>Common HTML elements and tags</li>
  <li>How to create your first web page</li>
  <li>Best practices for writing clean HTML</li>
</ul>

<h2>🏗️ HTML Document Structure</h2>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My First Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World!&lt;/h1&gt;
    &lt;p&gt;This is my first web page.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>`,
          },
          {
            title: 'HTML Elements and Tags',
            type: 'video',
            duration: 25,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE',
            content: '<h1>HTML Elements and Tags</h1><p>Learn about the most commonly used HTML elements.</p>',
          },
          {
            title: 'HTML Attributes',
            type: 'text',
            duration: 12,
            order: 3,
            content: '<h1>HTML Attributes</h1><p>Attributes provide additional information about HTML elements.</p>',
          },
        ],
      },
      {
        title: 'CSS Styling',
        description: 'Make your websites beautiful with CSS',
        order: 2,
        lessons: [
          {
            title: 'CSS Basics',
            type: 'text',
            duration: 20,
            order: 1,
            content: '<h1>CSS Basics</h1><p>CSS controls the visual presentation of HTML.</p>',
          },
          {
            title: 'CSS Selectors',
            type: 'video',
            duration: 18,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/l1mER1bV0N0',
            content: '<h1>CSS Selectors</h1><p>Target HTML elements with precision.</p>',
          },
        ],
      },
      {
        title: 'JavaScript Basics',
        description: 'Add interactivity to your websites',
        order: 3,
        lessons: [
          {
            title: 'Introduction to JavaScript',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>JavaScript</h1><p>Programming language for web interactivity.</p>',
          },
        ],
      },
      {
        title: 'Responsive Design',
        description: 'Create websites that work on all devices',
        order: 4,
        lessons: [
          {
            title: 'Media Queries',
            type: 'text',
            duration: 18,
            order: 1,
            content: '<h1>Responsive Design</h1><p>Adapt your site to different screen sizes.</p>',
          },
        ],
      },
      {
        title: 'Web Development Tools',
        description: 'Essential tools for modern developers',
        order: 5,
        lessons: [
          {
            title: 'Browser DevTools',
            type: 'video',
            duration: 20,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/TcTSqhpm80Y',
            content: '<h1>Developer Tools</h1><p>Debug and optimize your websites.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Data Structures and Algorithms',
    modules: [
      {
        title: 'Arrays and Strings',
        description: 'Master fundamental data structures',
        order: 1,
        lessons: [
          {
            title: 'Introduction to Arrays',
            type: 'text',
            duration: 20,
            order: 1,
            isPreview: true,
            content: '<h1>Arrays</h1><p>Learn about array data structures and operations.</p>',
          },
          {
            title: 'String Manipulation',
            type: 'video',
            duration: 25,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/zHjXhcmZbAY',
            content: '<h1>Strings</h1><p>Working with text data efficiently.</p>',
          },
        ],
      },
      {
        title: 'Linked Lists',
        description: 'Dynamic data structures',
        order: 2,
        lessons: [
          {
            title: 'Singly Linked Lists',
            type: 'text',
            duration: 25,
            order: 1,
            content: '<h1>Linked Lists</h1><p>Dynamic memory allocation for data storage.</p>',
          },
        ],
      },
      {
        title: 'Stacks and Queues',
        description: 'LIFO and FIFO structures',
        order: 3,
        lessons: [
          {
            title: 'Stack Implementation',
            type: 'text',
            duration: 20,
            order: 1,
            content: '<h1>Stacks</h1><p>Last In First Out data structure.</p>',
          },
        ],
      },
      {
        title: 'Trees and Graphs',
        description: 'Hierarchical data structures',
        order: 4,
        lessons: [
          {
            title: 'Binary Trees',
            type: 'video',
            duration: 30,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/qH6yxkw0u78',
            content: '<h1>Trees</h1><p>Hierarchical organization of data.</p>',
          },
        ],
      },
      {
        title: 'Sorting Algorithms',
        description: 'Efficient data organization',
        order: 5,
        lessons: [
          {
            title: 'Quick Sort',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>Sorting</h1><p>Organize data efficiently.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Database Management Systems',
    modules: [
      {
        title: 'Introduction to Databases',
        description: 'Understanding database fundamentals',
        order: 1,
        lessons: [
          {
            title: 'What is a Database?',
            type: 'text',
            duration: 15,
            order: 1,
            isPreview: true,
            content: '<h1>Databases</h1><p>Organized collection of structured data.</p>',
          },
          {
            title: 'Database Types',
            type: 'video',
            duration: 20,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/Tk1t3WKK-ZY',
            content: '<h1>DB Types</h1><p>SQL vs NoSQL databases.</p>',
          },
        ],
      },
      {
        title: 'SQL Fundamentals',
        description: 'Master SQL query language',
        order: 2,
        lessons: [
          {
            title: 'SELECT Statements',
            type: 'text',
            duration: 25,
            order: 1,
            content: '<h1>SQL SELECT</h1><p>Query data from databases.</p>',
          },
        ],
      },
      {
        title: 'Database Design',
        description: 'Create efficient database schemas',
        order: 3,
        lessons: [
          {
            title: 'Normalization',
            type: 'text',
            duration: 28,
            order: 1,
            content: '<h1>Normalization</h1><p>Organize data to reduce redundancy.</p>',
          },
        ],
      },
      {
        title: 'Advanced SQL',
        description: 'Complex queries and optimization',
        order: 4,
        lessons: [
          {
            title: 'Joins and Subqueries',
            type: 'video',
            duration: 30,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/9yeOJ0ZMUYw',
            content: '<h1>SQL Joins</h1><p>Combine data from multiple tables.</p>',
          },
        ],
      },
      {
        title: 'NoSQL Databases',
        description: 'Modern database solutions',
        order: 5,
        lessons: [
          {
            title: 'MongoDB Basics',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>MongoDB</h1><p>Document-based NoSQL database.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Machine Learning Fundamentals',
    modules: [
      {
        title: 'Introduction to ML',
        description: 'Understanding machine learning concepts',
        order: 1,
        lessons: [
          {
            title: 'What is Machine Learning?',
            type: 'text',
            duration: 20,
            order: 1,
            isPreview: true,
            content: '<h1>Machine Learning</h1><p>Teaching computers to learn from data.</p>',
          },
          {
            title: 'Types of ML',
            type: 'video',
            duration: 25,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
            content: '<h1>ML Types</h1><p>Supervised, unsupervised, and reinforcement learning.</p>',
          },
        ],
      },
      {
        title: 'Linear Regression',
        description: 'Predictive modeling basics',
        order: 2,
        lessons: [
          {
            title: 'Simple Linear Regression',
            type: 'text',
            duration: 28,
            order: 1,
            content: '<h1>Linear Regression</h1><p>Predict continuous values.</p>',
          },
        ],
      },
      {
        title: 'Classification Algorithms',
        description: 'Categorizing data',
        order: 3,
        lessons: [
          {
            title: 'Logistic Regression',
            type: 'text',
            duration: 26,
            order: 1,
            content: '<h1>Classification</h1><p>Categorize data into classes.</p>',
          },
        ],
      },
      {
        title: 'Neural Networks',
        description: 'Deep learning introduction',
        order: 4,
        lessons: [
          {
            title: 'Perceptrons',
            type: 'video',
            duration: 32,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
            content: '<h1>Neural Networks</h1><p>Building blocks of deep learning.</p>',
          },
        ],
      },
      {
        title: 'Model Evaluation',
        description: 'Assessing ML model performance',
        order: 5,
        lessons: [
          {
            title: 'Accuracy Metrics',
            type: 'text',
            duration: 20,
            order: 1,
            content: '<h1>Evaluation</h1><p>Measure model performance.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Mobile App Development',
    modules: [
      {
        title: 'Mobile Development Basics',
        description: 'Introduction to mobile platforms',
        order: 1,
        lessons: [
          {
            title: 'iOS vs Android',
            type: 'text',
            duration: 18,
            order: 1,
            isPreview: true,
            content: '<h1>Mobile Platforms</h1><p>Understanding iOS and Android ecosystems.</p>',
          },
          {
            title: 'Development Tools',
            type: 'video',
            duration: 22,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/fis26HvvDII',
            content: '<h1>Mobile Tools</h1><p>Xcode, Android Studio, and more.</p>',
          },
        ],
      },
      {
        title: 'React Native',
        description: 'Cross-platform development',
        order: 2,
        lessons: [
          {
            title: 'React Native Setup',
            type: 'text',
            duration: 25,
            order: 1,
            content: '<h1>React Native</h1><p>Build apps for iOS and Android with JavaScript.</p>',
          },
        ],
      },
      {
        title: 'UI Components',
        description: 'Building mobile interfaces',
        order: 3,
        lessons: [
          {
            title: 'Native Components',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>UI Components</h1><p>Create beautiful mobile interfaces.</p>',
          },
        ],
      },
      {
        title: 'Mobile APIs',
        description: 'Access device features',
        order: 4,
        lessons: [
          {
            title: 'Camera and Location',
            type: 'video',
            duration: 28,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/0-S5a0eXPoc',
            content: '<h1>Device APIs</h1><p>Access native device features.</p>',
          },
        ],
      },
      {
        title: 'App Deployment',
        description: 'Publishing your app',
        order: 5,
        lessons: [
          {
            title: 'App Store Submission',
            type: 'text',
            duration: 20,
            order: 1,
            content: '<h1>Deployment</h1><p>Publish apps to App Store and Play Store.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Cloud Computing with AWS',
    modules: [
      {
        title: 'AWS Fundamentals',
        description: 'Introduction to Amazon Web Services',
        order: 1,
        lessons: [
          {
            title: 'What is Cloud Computing?',
            type: 'text',
            duration: 18,
            order: 1,
            isPreview: true,
            content: '<h1>Cloud Computing</h1><p>On-demand computing resources.</p>',
          },
          {
            title: 'AWS Overview',
            type: 'video',
            duration: 22,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/ulprqHHWlng',
            content: '<h1>AWS</h1><p>Amazon Web Services platform overview.</p>',
          },
        ],
      },
      {
        title: 'EC2 and Compute',
        description: 'Virtual servers in the cloud',
        order: 2,
        lessons: [
          {
            title: 'EC2 Instances',
            type: 'text',
            duration: 26,
            order: 1,
            content: '<h1>EC2</h1><p>Elastic Compute Cloud for scalable computing.</p>',
          },
        ],
      },
      {
        title: 'S3 Storage',
        description: 'Object storage service',
        order: 3,
        lessons: [
          {
            title: 'S3 Buckets',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>S3</h1><p>Simple Storage Service for data storage.</p>',
          },
        ],
      },
      {
        title: 'Databases on AWS',
        description: 'Managed database services',
        order: 4,
        lessons: [
          {
            title: 'RDS and DynamoDB',
            type: 'video',
            duration: 28,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/eMzCI7S8YLY',
            content: '<h1>AWS Databases</h1><p>Relational and NoSQL database services.</p>',
          },
        ],
      },
      {
        title: 'Serverless Computing',
        description: 'Lambda and serverless architecture',
        order: 5,
        lessons: [
          {
            title: 'AWS Lambda',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>Serverless</h1><p>Run code without managing servers.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Cybersecurity Essentials',
    modules: [
      {
        title: 'Security Fundamentals',
        description: 'Understanding cybersecurity basics',
        order: 1,
        lessons: [
          {
            title: 'Introduction to Cybersecurity',
            type: 'text',
            duration: 20,
            order: 1,
            isPreview: true,
            content: '<h1>Cybersecurity</h1><p>Protecting systems and data from threats.</p>',
          },
          {
            title: 'Threat Landscape',
            type: 'video',
            duration: 24,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/inWWhr5tnEA',
            content: '<h1>Threats</h1><p>Understanding cyber threats and attacks.</p>',
          },
        ],
      },
      {
        title: 'Cryptography',
        description: 'Encryption and security',
        order: 2,
        lessons: [
          {
            title: 'Encryption Basics',
            type: 'text',
            duration: 26,
            order: 1,
            content: '<h1>Cryptography</h1><p>Securing data with encryption.</p>',
          },
        ],
      },
      {
        title: 'Network Security',
        description: 'Protecting network infrastructure',
        order: 3,
        lessons: [
          {
            title: 'Firewalls and VPNs',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>Network Security</h1><p>Securing network communications.</p>',
          },
        ],
      },
      {
        title: 'Application Security',
        description: 'Securing software applications',
        order: 4,
        lessons: [
          {
            title: 'OWASP Top 10',
            type: 'video',
            duration: 30,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/Lp0P3jWZ6vE',
            content: '<h1>App Security</h1><p>Common web application vulnerabilities.</p>',
          },
        ],
      },
      {
        title: 'Security Best Practices',
        description: 'Implementing security measures',
        order: 5,
        lessons: [
          {
            title: 'Security Audit',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>Best Practices</h1><p>Implementing robust security measures.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'UI/UX Design Principles',
    modules: [
      {
        title: 'Design Fundamentals',
        description: 'Core principles of design',
        order: 1,
        lessons: [
          {
            title: 'Introduction to UI/UX',
            type: 'text',
            duration: 18,
            order: 1,
            isPreview: true,
            content: '<h1>UI/UX Design</h1><p>Creating user-centered experiences.</p>',
          },
          {
            title: 'Design Thinking',
            type: 'video',
            duration: 22,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/_r0VX-aU_T8',
            content: '<h1>Design Thinking</h1><p>Problem-solving approach for design.</p>',
          },
        ],
      },
      {
        title: 'User Research',
        description: 'Understanding your users',
        order: 2,
        lessons: [
          {
            title: 'User Personas',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>User Research</h1><p>Understanding user needs and behaviors.</p>',
          },
        ],
      },
      {
        title: 'Wireframing',
        description: 'Creating design blueprints',
        order: 3,
        lessons: [
          {
            title: 'Low-Fidelity Wireframes',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>Wireframing</h1><p>Sketching interface layouts.</p>',
          },
        ],
      },
      {
        title: 'Visual Design',
        description: 'Creating beautiful interfaces',
        order: 4,
        lessons: [
          {
            title: 'Color Theory',
            type: 'video',
            duration: 26,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/_2LLXnUdUIc',
            content: '<h1>Visual Design</h1><p>Typography, color, and layout.</p>',
          },
        ],
      },
      {
        title: 'Prototyping',
        description: 'Building interactive prototypes',
        order: 5,
        lessons: [
          {
            title: 'Figma Basics',
            type: 'text',
            duration: 28,
            order: 1,
            content: '<h1>Prototyping</h1><p>Create interactive design prototypes.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'Python Programming',
    modules: [
      {
        title: 'Python Basics',
        description: 'Getting started with Python',
        order: 1,
        lessons: [
          {
            title: 'Introduction to Python',
            type: 'text',
            duration: 20,
            order: 1,
            isPreview: true,
            content: '<h1>Python</h1><p>Versatile programming language for beginners and experts.</p>',
          },
          {
            title: 'Python Setup',
            type: 'video',
            duration: 18,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            content: '<h1>Setup</h1><p>Installing Python and development environment.</p>',
          },
        ],
      },
      {
        title: 'Data Types and Variables',
        description: 'Working with data in Python',
        order: 2,
        lessons: [
          {
            title: 'Variables and Types',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>Data Types</h1><p>Understanding Python data structures.</p>',
          },
        ],
      },
      {
        title: 'Control Flow',
        description: 'Conditional logic and loops',
        order: 3,
        lessons: [
          {
            title: 'If Statements and Loops',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>Control Flow</h1><p>Making decisions and repeating code.</p>',
          },
        ],
      },
      {
        title: 'Functions and Modules',
        description: 'Organizing Python code',
        order: 4,
        lessons: [
          {
            title: 'Defining Functions',
            type: 'video',
            duration: 26,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/9Os0o3wzS_I',
            content: '<h1>Functions</h1><p>Reusable blocks of code.</p>',
          },
        ],
      },
      {
        title: 'Python Libraries',
        description: 'Popular Python packages',
        order: 5,
        lessons: [
          {
            title: 'NumPy and Pandas',
            type: 'text',
            duration: 28,
            order: 1,
            content: '<h1>Libraries</h1><p>Data manipulation with NumPy and Pandas.</p>',
          },
        ],
      },
    ],
  },
  {
    name: 'DevOps and CI/CD',
    modules: [
      {
        title: 'DevOps Introduction',
        description: 'Understanding DevOps culture',
        order: 1,
        lessons: [
          {
            title: 'What is DevOps?',
            type: 'text',
            duration: 18,
            order: 1,
            isPreview: true,
            content: '<h1>DevOps</h1><p>Bridging development and operations.</p>',
          },
          {
            title: 'DevOps Principles',
            type: 'video',
            duration: 22,
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/UbtB4sMaaNM',
            content: '<h1>Principles</h1><p>Collaboration, automation, and continuous improvement.</p>',
          },
        ],
      },
      {
        title: 'Version Control',
        description: 'Git and GitHub',
        order: 2,
        lessons: [
          {
            title: 'Git Fundamentals',
            type: 'text',
            duration: 24,
            order: 1,
            content: '<h1>Git</h1><p>Version control for collaborative development.</p>',
          },
        ],
      },
      {
        title: 'CI/CD Pipelines',
        description: 'Automated deployment workflows',
        order: 3,
        lessons: [
          {
            title: 'Jenkins Basics',
            type: 'text',
            duration: 26,
            order: 1,
            content: '<h1>CI/CD</h1><p>Continuous Integration and Deployment.</p>',
          },
        ],
      },
      {
        title: 'Containerization',
        description: 'Docker and Kubernetes',
        order: 4,
        lessons: [
          {
            title: 'Docker Fundamentals',
            type: 'video',
            duration: 30,
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/pg19Z8LL06w',
            content: '<h1>Docker</h1><p>Containerizing applications for consistency.</p>',
          },
        ],
      },
      {
        title: 'Monitoring and Logging',
        description: 'Observability in production',
        order: 5,
        lessons: [
          {
            title: 'Application Monitoring',
            type: 'text',
            duration: 22,
            order: 1,
            content: '<h1>Monitoring</h1><p>Tracking application performance and health.</p>',
          },
        ],
      },
    ],
  },
];

async function addCourseContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const courseContent of coursesContent) {
      console.log(`📚 Processing: ${courseContent.name}`);
      
      // Find the course by name
      const course = await Course.findOne({ name: courseContent.name });
      
      if (!course) {
        console.log(`   ❌ Course not found: ${courseContent.name}`);
        continue;
      }

      // Update course with modules
      course.modules = courseContent.modules;
      await course.save();
      
      console.log(`   ✅ Added ${courseContent.modules.length} modules`);
      
      // Count total lessons
      const totalLessons = courseContent.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );
      console.log(`   📝 Total lessons: ${totalLessons}\n`);
    }

    console.log('🎉 All course content added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Courses updated: ${coursesContent.length}`);
    console.log(`   Total modules: ${coursesContent.length * 5}`);
    
    const totalLessons = coursesContent.reduce(
      (sum, course) => sum + course.modules.reduce(
        (modSum, mod) => modSum + mod.lessons.length,
        0
      ),
      0
    );
    console.log(`   Total lessons: ${totalLessons}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
addCourseContent();
