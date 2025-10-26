const mongoose = require('mongoose');
const { Course } = require('./models');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh';

/**
 * Generate comprehensive lesson content based on title and context
 */
function generateDetailedContent(lessonTitle, moduleName, courseName, category) {
  const title = lessonTitle.toLowerCase();
  
  // HTML/Web Development Content
  if (title.includes('html') && (title.includes('element') || title.includes('tag'))) {
    return `<h1>HTML Elements and Tags 🏗️</h1>

<h2>Understanding HTML Elements</h2>
<p>HTML elements are the building blocks of web pages. An element consists of a start tag, content, and an end tag. Understanding elements is crucial for creating well-structured web pages.</p>

<h2>🎯 Anatomy of an HTML Element</h2>
<pre><code>&lt;tagname&gt;Content goes here&lt;/tagname&gt;

Components:
- Opening Tag: &lt;tagname&gt;
- Content: The text or nested elements
- Closing Tag: &lt;/tagname&gt;</code></pre>

<h2>📚 Common HTML Elements</h2>

<h3>Text Content Elements</h3>
<pre><code>&lt;h1&gt; to &lt;h6&gt; - Headings (h1 is largest, h6 is smallest)
&lt;p&gt; - Paragraph
&lt;span&gt; - Inline container
&lt;div&gt; - Block-level container
&lt;strong&gt; - Bold/Important text
&lt;em&gt; - Emphasized/Italic text
&lt;br&gt; - Line break (self-closing)
&lt;hr&gt; - Horizontal rule (self-closing)</code></pre>

<h3>List Elements</h3>
<pre><code>&lt;ul&gt; - Unordered list (bullets)
  &lt;li&gt;List item&lt;/li&gt;
&lt;/ul&gt;

&lt;ol&gt; - Ordered list (numbers)
  &lt;li&gt;First item&lt;/li&gt;
  &lt;li&gt;Second item&lt;/li&gt;
&lt;/ol&gt;

&lt;dl&gt; - Description list
  &lt;dt&gt;Term&lt;/dt&gt;
  &lt;dd&gt;Definition&lt;/dd&gt;
&lt;/dl&gt;</code></pre>

<h3>Link and Media Elements</h3>
<pre><code>&lt;a href="url"&gt;Link text&lt;/a&gt; - Hyperlink
&lt;img src="image.jpg" alt="description"&gt; - Image (self-closing)
&lt;video src="video.mp4" controls&gt;&lt;/video&gt; - Video player
&lt;audio src="audio.mp3" controls&gt;&lt;/audio&gt; - Audio player</code></pre>

<h3>Form Elements</h3>
<pre><code>&lt;form&gt; - Form container
&lt;input type="text"&gt; - Text input
&lt;textarea&gt;&lt;/textarea&gt; - Multi-line text
&lt;button&gt;Click me&lt;/button&gt; - Button
&lt;select&gt;
  &lt;option&gt;Choice 1&lt;/option&gt;
&lt;/select&gt; - Dropdown</code></pre>

<h3>Semantic HTML5 Elements</h3>
<pre><code>&lt;header&gt; - Page or section header
&lt;nav&gt; - Navigation links
&lt;main&gt; - Main content
&lt;article&gt; - Independent content
&lt;section&gt; - Thematic grouping
&lt;aside&gt; - Sidebar content
&lt;footer&gt; - Page or section footer</code></pre>

<h2>🔍 Block vs Inline Elements</h2>

<h3>Block-level Elements</h3>
<ul>
  <li>Start on a new line</li>
  <li>Take up full width available</li>
  <li>Can contain other block or inline elements</li>
  <li>Examples: &lt;div&gt;, &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;, &lt;section&gt;</li>
</ul>

<h3>Inline Elements</h3>
<ul>
  <li>Do not start on a new line</li>
  <li>Only take up necessary width</li>
  <li>Can only contain other inline elements</li>
  <li>Examples: &lt;span&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;</li>
</ul>

<h2>💡 Self-Closing Tags</h2>
<p>Some elements don't need closing tags because they don't contain content:</p>
<pre><code>&lt;img src="photo.jpg" alt="Photo"&gt;
&lt;br&gt;
&lt;hr&gt;
&lt;input type="text"&gt;
&lt;meta charset="UTF-8"&gt;
&lt;link rel="stylesheet" href="style.css"&gt;</code></pre>

<h2>🎨 Practical Example</h2>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;title&gt;My Web Page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;header&gt;
    &lt;h1&gt;Welcome to My Site&lt;/h1&gt;
    &lt;nav&gt;
      &lt;ul&gt;
        &lt;li&gt;&lt;a href="#home"&gt;Home&lt;/a&gt;&lt;/li&gt;
        &lt;li&gt;&lt;a href="#about"&gt;About&lt;/a&gt;&lt;/li&gt;
      &lt;/ul&gt;
    &lt;/nav&gt;
  &lt;/header&gt;
  
  &lt;main&gt;
    &lt;article&gt;
      &lt;h2&gt;Article Title&lt;/h2&gt;
      &lt;p&gt;This is a &lt;strong&gt;paragraph&lt;/strong&gt; with &lt;em&gt;emphasis&lt;/em&gt;.&lt;/p&gt;
      &lt;img src="image.jpg" alt="Description"&gt;
    &lt;/article&gt;
  &lt;/main&gt;
  
  &lt;footer&gt;
    &lt;p&gt;&copy; 2024 My Website&lt;/p&gt;
  &lt;/footer&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>✅ Best Practices</h2>
<ul>
  <li><strong>Use semantic HTML:</strong> Choose elements based on meaning, not appearance</li>
  <li><strong>Proper nesting:</strong> Close tags in reverse order of opening</li>
  <li><strong>Accessibility:</strong> Use alt text for images, labels for forms</li>
  <li><strong>Validation:</strong> Ensure your HTML is valid and well-formed</li>
  <li><strong>Indentation:</strong> Indent nested elements for readability</li>
</ul>

<h2>⚠️ Common Mistakes</h2>
<ul>
  <li>Forgetting closing tags</li>
  <li>Incorrect nesting (e.g., &lt;p&gt;&lt;div&gt;&lt;/div&gt;&lt;/p&gt;)</li>
  <li>Using block elements inside inline elements</li>
  <li>Missing required attributes (src for img, href for links)</li>
  <li>Not using semantic HTML5 elements</li>
</ul>

<h2>🎯 Practice Exercises</h2>
<ol>
  <li>Create a simple blog post with header, main content, and footer</li>
  <li>Build a navigation menu with links</li>
  <li>Design a contact form with various input types</li>
  <li>Create a product card with image, title, and description</li>
  <li>Build a simple webpage using only semantic HTML5 elements</li>
</ol>

<h2>📝 Summary</h2>
<p>HTML elements are the foundation of web development. Mastering them enables you to:</p>
<ul>
  <li>Create well-structured, accessible websites</li>
  <li>Work efficiently with CSS and JavaScript</li>
  <li>Build responsive, modern web applications</li>
  <li>Understand how web pages are constructed</li>
</ul>`;
  }

  if (title.includes('html') && title.includes('attribute')) {
    return `<h1>HTML Attributes 🎯</h1>

<h2>What are HTML Attributes?</h2>
<p>HTML attributes provide additional information about HTML elements. They are always specified in the opening tag and usually come in name/value pairs like: <code>name="value"</code></p>

<h2>📚 Common Global Attributes</h2>
<p>These attributes can be used on any HTML element:</p>

<h3>1. id Attribute</h3>
<pre><code>&lt;div id="header"&gt;Header Content&lt;/div&gt;

- Unique identifier for an element
- Must be unique within the page
- Used for CSS styling and JavaScript selection
- Used for anchor links (#header)</code></pre>

<h3>2. class Attribute</h3>
<pre><code>&lt;p class="intro highlight"&gt;Text&lt;/p&gt;

- Assigns one or more class names
- Multiple classes separated by spaces
- Same class can be used on multiple elements
- Primary method for CSS styling</code></pre>

<h3>3. style Attribute</h3>
<pre><code>&lt;p style="color: #FF69B4; font-size: 16px;"&gt;Styled text&lt;/p&gt;

- Inline CSS styling
- Not recommended (use external CSS instead)
- Useful for quick testing</code></pre>

<h3>4. title Attribute</h3>
<pre><code>&lt;abbr title="HyperText Markup Language"&gt;HTML&lt;/abbr&gt;

- Provides extra information
- Shown as tooltip on hover
- Good for accessibility</code></pre>

<h3>5. data-* Attributes</h3>
<pre><code>&lt;div data-user-id="12345" data-role="admin"&gt;User Info&lt;/div&gt;

- Custom data attributes
- Store custom data in HTML elements
- Accessible via JavaScript
- Useful for dynamic applications</code></pre>

<h2>🔗 Link Attributes</h2>
<pre><code>&lt;a href="https://example.com" 
   target="_blank" 
   rel="noopener noreferrer"
   title="Visit Example"&gt;
  Click Here
&lt;/a&gt;

Attributes:
- href: Destination URL
- target: Where to open (_blank, _self, _parent, _top)
- rel: Relationship (noopener, nofollow, etc.)
- download: Download link instead of navigate</code></pre>

<h2>🖼️ Image Attributes</h2>
<pre><code>&lt;img src="photo.jpg" 
     alt="Beautiful sunset" 
     width="600" 
     height="400"
     loading="lazy"
     title="Sunset Photo"&gt;

Required:
- src: Image source path
- alt: Alternative text (accessibility)

Optional:
- width/height: Dimensions in pixels
- loading: lazy (load when needed) or eager
- title: Tooltip text</code></pre>

<h2>📝 Form Attributes</h2>

<h3>Input Attributes</h3>
<pre><code>&lt;input type="text" 
       name="username" 
       id="username"
       placeholder="Enter username"
       required
       maxlength="50"
       pattern="[A-Za-z]+"
       value="default"&gt;

Common attributes:
- type: text, email, password, number, date, etc.
- name: Form submission name
- placeholder: Hint text
- required: Must be filled
- disabled: Cannot be edited
- readonly: Can view but not edit
- value: Initial/current value
- autocomplete: on/off</code></pre>

<h3>Form Element Attributes</h3>
<pre><code>&lt;form action="/submit" 
      method="POST" 
      enctype="multipart/form-data"
      autocomplete="off"&gt;

- action: Where to send form data
- method: GET or POST
- enctype: Encoding type (for file uploads)
- target: Where to display response</code></pre>

<h2>🎬 Media Attributes</h2>

<h3>Video Attributes</h3>
<pre><code>&lt;video src="video.mp4" 
       controls 
       autoplay 
       loop 
       muted
       width="640" 
       height="360"
       poster="thumbnail.jpg"&gt;
&lt;/video&gt;

- controls: Show playback controls
- autoplay: Start automatically
- loop: Repeat video
- muted: No sound
- poster: Thumbnail before play</code></pre>

<h2>📊 Boolean Attributes</h2>
<p>Some attributes don't need values - their presence indicates "true":</p>
<pre><code>&lt;input type="checkbox" checked&gt;
&lt;button disabled&gt;Click&lt;/button&gt;
&lt;script async src="script.js"&gt;&lt;/script&gt;

Boolean attributes:
- checked
- disabled
- readonly
- required
- selected
- hidden
- async
- defer</code></pre>

<h2>🌐 Accessibility Attributes (ARIA)</h2>
<pre><code>&lt;button aria-label="Close dialog" 
        aria-pressed="false"
        role="button"&gt;
  ×
&lt;/button&gt;

- aria-label: Accessible name
- aria-describedby: Additional description
- role: Semantic role
- aria-hidden: Hide from screen readers</code></pre>

<h2>💡 Best Practices</h2>
<ul>
  <li><strong>Always use alt text</strong> for images (accessibility)</li>
  <li><strong>Use descriptive IDs and classes</strong> (e.g., "main-nav" not "div1")</li>
  <li><strong>Validate attribute values</strong> (check syntax and format)</li>
  <li><strong>Use data-* for custom data</strong> instead of non-standard attributes</li>
  <li><strong>Keep inline styles minimal</strong> (prefer external CSS)</li>
  <li><strong>Use semantic attributes</strong> (lang, dir, role)</li>
</ul>

<h2>⚠️ Common Mistakes</h2>
<ul>
  <li>Forgetting quotes around attribute values</li>
  <li>Using spaces in ID names</li>
  <li>Duplicate IDs on the same page</li>
  <li>Missing required attributes (src, alt, href)</li>
  <li>Using deprecated attributes (align, bgcolor)</li>
</ul>

<h2>🎯 Practice Exercises</h2>
<ol>
  <li>Create a form with various input types and attributes</li>
  <li>Build an image gallery with proper alt texts and titles</li>
  <li>Make a navigation menu using appropriate link attributes</li>
  <li>Create a data table with accessibility attributes</li>
  <li>Build a responsive video player with controls</li>
</ol>

<h2>📝 Summary</h2>
<p>HTML attributes enhance elements by:</p>
<ul>
  <li>Providing additional information and metadata</li>
  <li>Controlling element behavior</li>
  <li>Improving accessibility</li>
  <li>Enabling JavaScript interaction</li>
  <li>Supporting responsive and dynamic content</li>
</ul>`;
  }
  
  if (title.includes('javascript') && title.includes('intro')) {
    return `<h1>Introduction to JavaScript 🚀</h1>

<h2>What is JavaScript?</h2>
<p>JavaScript is a high-level, interpreted programming language that makes web pages interactive. It's one of the core technologies of the World Wide Web, alongside HTML and CSS.</p>

<h2>🎯 Why Learn JavaScript?</h2>
<ul>
  <li><strong>Universal:</strong> Runs in every web browser</li>
  <li><strong>Versatile:</strong> Front-end, back-end (Node.js), mobile apps</li>
  <li><strong>In-Demand:</strong> Most popular programming language</li>
  <li><strong>Dynamic:</strong> Create interactive, responsive user experiences</li>
  <li><strong>Easy to Start:</strong> No installation needed - just a browser!</li>
</ul>

<h2>📚 JavaScript Basics</h2>

<h3>1. Variables</h3>
<pre><code>// Declaring variables
let name = "Aarambh";       // Can be reassigned
const PI = 3.14159;         // Cannot be reassigned
var oldWay = "avoid this";  // Old syntax (avoid)

// Data types
let number = 42;            // Number
let text = "Hello";         // String
let isActive = true;        // Boolean
let nothing = null;         // Null
let notDefined;             // Undefined
let arr = [1, 2, 3];       // Array
let obj = {name: "John"};  // Object</code></pre>

<h3>2. Operators</h3>
<pre><code>// Arithmetic
let sum = 10 + 5;           // 15
let difference = 10 - 5;    // 5
let product = 10 * 5;       // 50
let quotient = 10 / 5;      // 2
let remainder = 10 % 3;     // 1

// Comparison
10 === 10    // true (strict equality)
10 == "10"   // true (loose equality)
10 !== 5     // true (not equal)
10 > 5       // true
10 <= 10     // true

// Logical
true && false    // false (AND)
true || false    // true (OR)
!true            // false (NOT)</code></pre>

<h3>3. Conditional Statements</h3>
<pre><code>// if-else
if (age >= 18) {
  console.log("Adult");
} else if (age >= 13) {
  console.log("Teenager");
} else {
  console.log("Child");
}

// Ternary operator
let status = age >= 18 ? "Adult" : "Minor";

// Switch statement
switch(day) {
  case "Monday":
    console.log("Start of week");
    break;
  case "Friday":
    console.log("Almost weekend!");
    break;
  default:
    console.log("Regular day");
}</code></pre>

<h3>4. Loops</h3>
<pre><code>// For loop
for (let i = 0; i < 5; i++) {
  console.log(i);  // 0, 1, 2, 3, 4
}

// While loop
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}

// For...of (arrays)
let fruits = ["apple", "banana", "orange"];
for (let fruit of fruits) {
  console.log(fruit);
}

// For...in (objects)
let person = {name: "John", age: 30};
for (let key in person) {
  console.log(key + ": " + person[key]);
}</code></pre>

<h3>5. Functions</h3>
<pre><code>// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function expression
const greet = function(name) {
  return "Hello, " + name + "!";
};

// Arrow function (ES6)
const greet = (name) => {
  return "Hello, " + name + "!";
};

// Concise arrow function
const greet = name => "Hello, " + name + "!";

// Usage
console.log(greet("Aarambh"));  // "Hello, Aarambh!"</code></pre>

<h2>🎨 DOM Manipulation</h2>
<p>JavaScript can interact with HTML elements:</p>

<pre><code>// Select elements
const element = document.getElementById("myId");
const elements = document.querySelectorAll(".myClass");

// Modify content
element.textContent = "New text";
element.innerHTML = "&lt;strong&gt;Bold text&lt;/strong&gt;";

// Change styles
element.style.color = "#FF69B4";
element.style.fontSize = "20px";

// Add/remove classes
element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("visible");

// Event listeners
element.addEventListener("click", function() {
  alert("Element clicked!");
});

// Create new elements
const newDiv = document.createElement("div");
newDiv.textContent = "New element";
document.body.appendChild(newDiv);</code></pre>

<h2>📦 Arrays</h2>
<pre><code>let fruits = ["apple", "banana", "orange"];

// Common methods
fruits.push("grape");        // Add to end
fruits.pop();                // Remove from end
fruits.unshift("mango");     // Add to start
fruits.shift();              // Remove from start

// Array methods
fruits.length                // 3
fruits[0]                    // "apple"
fruits.indexOf("banana")     // 1
fruits.includes("orange")    // true

// Iteration methods
fruits.forEach(fruit => console.log(fruit));
let upper = fruits.map(fruit => fruit.toUpperCase());
let long = fruits.filter(fruit => fruit.length > 5);
let total = [1,2,3,4].reduce((sum, num) => sum + num, 0);</code></pre>

<h2>🎯 Objects</h2>
<pre><code>// Object literal
let person = {
  name: "John",
  age: 30,
  city: "New York",
  greet: function() {
    return "Hello, I'm " + this.name;
  }
};

// Access properties
console.log(person.name);        // "John"
console.log(person["age"]);      // 30
console.log(person.greet());     // "Hello, I'm John"

// Modify properties
person.age = 31;
person.email = "john@example.com";
delete person.city;

// Object methods
Object.keys(person);      // ["name", "age", "email"]
Object.values(person);    // ["John", 31, "john@example.com"]
Object.entries(person);   // [["name", "John"], ...]</code></pre>

<h2>💡 Modern JavaScript (ES6+)</h2>

<h3>Template Literals</h3>
<pre><code>let name = "Aarambh";
let greeting = \`Hello, \${name}! Welcome to learning.\`;
let multiline = \`
  This is a
  multiline
  string
\`;</code></pre>

<h3>Destructuring</h3>
<pre><code>// Array destructuring
let [first, second] = [1, 2, 3];

// Object destructuring
let {name, age} = {name: "John", age: 30};

// Function parameters
function greet({name, age}) {
  return \`\${name} is \${age} years old\`;
}</code></pre>

<h3>Spread Operator</h3>
<pre><code>let arr1 = [1, 2, 3];
let arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

let obj1 = {a: 1, b: 2};
let obj2 = {...obj1, c: 3};  // {a: 1, b: 2, c: 3}</code></pre>

<h2>⚠️ Common Mistakes</h2>
<ul>
  <li>Using == instead of === (loose vs strict equality)</li>
  <li>Forgetting to use let/const (creates global variables)</li>
  <li>Not understanding "this" context</li>
  <li>Modifying arrays/objects while looping</li>
  <li>Not handling asynchronous operations properly</li>
</ul>

<h2>🚀 Next Steps</h2>
<ul>
  <li>Practice with coding challenges (CodeWars, LeetCode)</li>
  <li>Build small projects (calculator, to-do list)</li>
  <li>Learn asynchronous JavaScript (Promises, async/await)</li>
  <li>Explore frameworks (React, Vue, Angular)</li>
  <li>Study Node.js for backend development</li>
</ul>

<h2>📝 Summary</h2>
<p>JavaScript is essential for:</p>
<ul>
  <li>Creating interactive web applications</li>
  <li>Manipulating HTML and CSS dynamically</li>
  <li>Handling user events and interactions</li>
  <li>Building full-stack applications</li>
  <li>Developing modern, responsive user interfaces</li>
</ul>`;
  }
  
  if (title.includes('media') && (title.includes('query') || title.includes('responsive'))) {
    return `<h1>Media Queries & Responsive Design 📱💻</h1>

<h2>What is Responsive Design?</h2>
<p>Responsive web design is an approach that makes web pages render well on a variety of devices and screen sizes. Media queries are the CSS technique that makes this possible.</p>

<h2>🎯 Why Responsive Design?</h2>
<ul>
  <li><strong>Mobile-First World:</strong> Over 60% of web traffic is mobile</li>
  <li><strong>Better UX:</strong> Optimized experience for every device</li>
  <li><strong>SEO Benefits:</strong> Google favors mobile-friendly sites</li>
  <li><strong>Cost-Effective:</strong> One codebase for all devices</li>
  <li><strong>Future-Proof:</strong> Works on new devices automatically</li>
</ul>

<h2>📐 Media Query Syntax</h2>

<h3>Basic Structure</h3>
<pre><code>@media media-type and (condition) {
  /* CSS rules */
}

Example:
@media screen and (max-width: 768px) {
  body {
    font-size: 14px;
  }
}</code></pre>

<h3>Media Types</h3>
<pre><code>@media screen { }    /* Computer screens, tablets, phones */
@media print { }     /* Printed pages */
@media speech { }    /* Screen readers */
@media all { }       /* All devices (default) */</code></pre>

<h2>🎨 Common Breakpoints</h2>
<pre><code>/* Mobile First Approach */

/* Extra small devices (phones, less than 576px) */
/* No media query needed - this is the default */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
  
  .nav {
    display: flex;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
  
  .sidebar {
    display: block;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}</code></pre>

<h2>🔧 Media Query Conditions</h2>

<h3>Width Conditions</h3>
<pre><code>/* Exact width */
@media (width: 768px) { }

/* Maximum width */
@media (max-width: 768px) { }

/* Minimum width */
@media (min-width: 768px) { }

/* Width range */
@media (min-width: 576px) and (max-width: 992px) { }</code></pre>

<h3>Height Conditions</h3>
<pre><code>@media (min-height: 600px) { }
@media (max-height: 800px) { }</code></pre>

<h3>Orientation</h3>
<pre><code>@media (orientation: portrait) {
  /* Vertical orientation */
}

@media (orientation: landscape) {
  /* Horizontal orientation */
}</code></pre>

<h3>Resolution</h3>
<pre><code>/* High DPI screens (Retina) */
@media (min-resolution: 192dpi) {
  img {
    /* Use high-res images */
  }
}</code></pre>

<h2>💻 Complete Responsive Example</h2>

<h3>HTML</h3>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;Responsive Page&lt;/title&gt;
  &lt;link rel="stylesheet" href="styles.css"&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;header class="header"&gt;
    &lt;nav class="nav"&gt;
      &lt;div class="logo"&gt;Logo&lt;/div&gt;
      &lt;ul class="nav-menu"&gt;
        &lt;li&gt;Home&lt;/li&gt;
        &lt;li&gt;About&lt;/li&gt;
        &lt;li&gt;Contact&lt;/li&gt;
      &lt;/ul&gt;
    &lt;/nav&gt;
  &lt;/header&gt;
  
  &lt;main class="container"&gt;
    &lt;section class="content"&gt;Main Content&lt;/section&gt;
    &lt;aside class="sidebar"&gt;Sidebar&lt;/aside&gt;
  &lt;/main&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h3>CSS</h3>
<pre><code>/* Mobile First - Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

.container {
  padding: 20px;
  max-width: 100%;
}

.nav {
  background: #FF69B4;
  padding: 1rem;
}

.nav-menu {
  display: none; /* Hidden on mobile */
  list-style: none;
}

.sidebar {
  display: none; /* Hidden on mobile */
}

/* Tablet Styles (768px and up) */
@media (min-width: 768px) {
  body {
    font-size: 18px;
  }
  
  .container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    max-width: 720px;
    margin: 0 auto;
  }
  
  .nav-menu {
    display: flex;
    gap: 1rem;
  }
  
  .sidebar {
    display: block;
  }
}

/* Desktop Styles (992px and up) */
@media (min-width: 992px) {
  .container {
    max-width: 960px;
    grid-template-columns: 3fr 1fr;
    gap: 30px;
  }
  
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}</code></pre>

<h2>🎨 Responsive Images</h2>
<pre><code>/* CSS */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* HTML - Multiple Sources */
&lt;picture&gt;
  &lt;source media="(min-width: 1200px)" srcset="large.jpg"&gt;
  &lt;source media="(min-width: 768px)" srcset="medium.jpg"&gt;
  &lt;img src="small.jpg" alt="Responsive image"&gt;
&lt;/picture&gt;

/* srcset for different resolutions */
&lt;img srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1280w.jpg 1280w"
     sizes="(max-width: 768px) 100vw,
            (max-width: 1200px) 50vw,
            33vw"
     src="image-640w.jpg" alt="Image"&gt;</code></pre>

<h2>📱 Viewport Meta Tag</h2>
<p>Essential for responsive design:</p>
<pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;

Attributes:
- width=device-width: Match screen width
- initial-scale=1.0: Initial zoom level
- maximum-scale=1.0: Prevent zoom
- user-scalable=no: Disable pinch zoom (avoid!)</code></pre>

<h2>🎯 Responsive Typography</h2>
<pre><code>/* Fluid Typography */
body {
  font-size: clamp(16px, 4vw, 24px);
}

/* Responsive with calc() */
h1 {
  font-size: calc(1.5rem + 1vw);
}

/* Media query approach */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 20px;
  }
}</code></pre>

<h2>🔄 Flexbox for Responsive Layouts</h2>
<pre><code>.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 1 1 300px; /* grow, shrink, basis */
}

/* Stack on mobile */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}</code></pre>

<h2>📊 Grid for Responsive Layouts</h2>
<pre><code>.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Alternative */
.grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
  }
}</code></pre>

<h2>💡 Best Practices</h2>
<ul>
  <li><strong>Mobile-First:</strong> Start with mobile styles, add complexity for larger screens</li>
  <li><strong>Flexible Units:</strong> Use %, em, rem, vw, vh instead of fixed pixels</li>
  <li><strong>Test on Real Devices:</strong> Don't rely only on browser dev tools</li>
  <li><strong>Optimize Images:</strong> Serve appropriate sizes for each device</li>
  <li><strong>Touch-Friendly:</strong> Make buttons/links large enough for fingers (44x44px minimum)</li>
  <li><strong>Avoid Horizontal Scroll:</strong> Ensure content fits within viewport</li>
</ul>

<h2>⚠️ Common Mistakes</h2>
<ul>
  <li>Forgetting the viewport meta tag</li>
  <li>Using fixed widths instead of max-width</li>
  <li>Too many breakpoints (keep it simple)</li>
  <li>Not testing on actual devices</li>
  <li>Ignoring landscape orientation</li>
  <li>Making touch targets too small</li>
</ul>

<h2>🎯 Practice Exercises</h2>
<ol>
  <li>Create a responsive navigation menu (hamburger on mobile)</li>
  <li>Build a responsive card grid (1/2/3 columns)</li>
  <li>Design a responsive hero section</li>
  <li>Make a responsive form layout</li>
  <li>Create a responsive image gallery</li>
</ol>

<h2>📝 Summary</h2>
<p>Responsive design ensures your website:</p>
<ul>
  <li>Works beautifully on all devices</li>
  <li>Provides optimal user experience</li>
  <li>Ranks better in search engines</li>
  <li>Reaches wider audience</li>
  <li>Future-proofs your web presence</li>
</ul>`;
  }

  // Default comprehensive template for other topics
  return `<h1>${lessonTitle} 📚</h1>

<h2>Introduction</h2>
<p>Welcome to this comprehensive lesson on ${lessonTitle}. This topic is part of the ${moduleName} module in the ${courseName} course, and is essential for mastering ${category} concepts.</p>

<h2>🎯 Learning Objectives</h2>
<p>By the end of this lesson, you will be able to:</p>
<ul>
  <li>Understand the core concepts of ${lessonTitle}</li>
  <li>Apply practical techniques in real-world scenarios</li>
  <li>Recognize common patterns and best practices</li>
  <li>Avoid common pitfalls and mistakes</li>
  <li>Implement solutions following industry standards</li>
</ul>

<h2>📖 Key Concepts</h2>

<h3>What is ${lessonTitle}?</h3>
<p>${lessonTitle} is a fundamental concept in ${category} that plays a crucial role in ${courseName}. Understanding this topic will help you build more effective and efficient solutions in your projects.</p>

<h3>Why Does It Matter?</h3>
<ul>
  <li><strong>Practical Application:</strong> Used extensively in professional projects and real-world applications</li>
  <li><strong>Foundation:</strong> Forms the basis for more advanced topics in ${category}</li>
  <li><strong>Industry Standard:</strong> Widely adopted in the industry with established best practices</li>
  <li><strong>Problem Solving:</strong> Helps solve complex problems efficiently and elegantly</li>
  <li><strong>Career Growth:</strong> Essential knowledge for advancement in ${category} roles</li>
</ul>

<h2>💻 Practical Examples</h2>

<h3>Example 1: Basic Implementation</h3>
<pre><code>// Basic example demonstrating ${lessonTitle}
// This shows the fundamental approach

// Step 1: Setup
const example = "demonstration";

// Step 2: Implementation
function demonstrate() {
  console.log("Example output for ${lessonTitle}");
  return true;
}

// Step 3: Usage
const result = demonstrate();
console.log("Result:", result);</code></pre>

<h3>Example 2: Intermediate Usage</h3>
<pre><code>// More complex example showing real-world application

class ${lessonTitle.replace(/\s+/g, '')}Example {
  constructor(options = {}) {
    this.data = [];
    this.options = options;
  }
  
  process(input) {
    // Implementation details for ${lessonTitle}
    console.log("Processing with ${lessonTitle}");
    return this.data;
  }
  
  validate() {
    // Validation logic
    return this.data.length > 0;
  }
}

const instance = new ${lessonTitle.replace(/\s+/g, '')}Example();
instance.process("sample input");</code></pre>

<h3>Example 3: Advanced Application</h3>
<pre><code>// Advanced example with error handling and optimization

class Advanced${lessonTitle.replace(/\s+/g, '')} {
  static async create(config) {
    const instance = new Advanced${lessonTitle.replace(/\s+/g, '')}();
    await instance.initialize(config);
    return instance;
  }
  
  async initialize(config) {
    try {
      // Initialization logic
      this.config = config;
      console.log("${lessonTitle} initialized with config:", config);
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
  }
  
  async execute(data) {
    // Main execution logic
    if (!data) {
      throw new Error("Data is required");
    }
    
    // Process data with ${lessonTitle} techniques
    const result = await this.processData(data);
    return result;
  }
  
  async processData(data) {
    // Core processing implementation
    return {
      input: data,
      output: "processed result",
      timestamp: new Date().toISOString()
    };
  }
}

// Usage
async function use${lessonTitle.replace(/\s+/g, '')}() {
  try {
    const processor = await Advanced${lessonTitle.replace(/\s+/g, '')}.create({ mode: "advanced" });
    const result = await processor.execute("sample data");
    console.log("Processing result:", result);
  } catch (error) {
    console.error("Execution failed:", error);
  }
}

// Execute the example
use${lessonTitle.replace(/\s+/g, '')}();</code></pre>

<h2>🎨 Best Practices</h2>
<ul>
  <li><strong>Follow Standards:</strong> Adhere to industry conventions and guidelines for ${category}</li>
  <li><strong>Keep It Simple:</strong> Start with basics before adding complexity to your ${lessonTitle} implementations</li>
  <li><strong>Document Your Code:</strong> Add clear comments and documentation for ${lessonTitle} components</li>
  <li><strong>Test Thoroughly:</strong> Validate your ${lessonTitle} implementation works correctly across scenarios</li>
  <li><strong>Optimize Wisely:</strong> Balance performance with readability in ${lessonTitle} solutions</li>
  <li><strong>Security First:</strong> Consider security implications when implementing ${lessonTitle}</li>
  <li><strong>Maintainability:</strong> Write ${lessonTitle} code that is easy to maintain and extend</li>
</ul>

<h2>⚠️ Common Mistakes to Avoid</h2>
<ul>
  <li>Skipping fundamental understanding of ${lessonTitle} concepts</li>
  <li>Over-complicating simple ${lessonTitle} solutions</li>
  <li>Ignoring edge cases in ${lessonTitle} implementations</li>
  <li>Not testing ${lessonTitle} with different input scenarios</li>
  <li>Forgetting to handle errors properly in ${lessonTitle} code</li>
  <li>Writing ${lessonTitle} code that is hard to maintain or debug</li>
  <li>Not following ${category} best practices in ${lessonTitle} implementations</li>
</ul>

<h2>🚀 Real-World Applications</h2>
<p>${lessonTitle} is used in various real-world scenarios:</p>
<ul>
  <li>Building scalable ${category} applications with robust ${lessonTitle} implementations</li>
  <li>Solving performance challenges through optimized ${lessonTitle} techniques</li>
  <li>Creating user-friendly interfaces that leverage ${lessonTitle} effectively</li>
  <li>Implementing business logic that depends on ${lessonTitle} concepts</li>
  <li>Optimizing system efficiency with advanced ${lessonTitle} patterns</li>
  <li>Developing APIs and services that utilize ${lessonTitle} for data processing</li>
</ul>

<h2>💡 Tips and Tricks</h2>
<ul>
  <li>Practice regularly to build muscle memory with ${lessonTitle} concepts</li>
  <li>Study examples from open-source projects that implement ${lessonTitle}</li>
  <li>Experiment with different approaches to ${lessonTitle} problem-solving</li>
  <li>Join ${category} communities to learn from others' ${lessonTitle} experiences</li>
  <li>Build small projects to apply ${lessonTitle} concepts in practice</li>
  <li>Review and refactor your ${lessonTitle} code regularly for improvements</li>
  <li>Stay updated with the latest ${lessonTitle} trends and best practices</li>
</ul>

<h2>🎯 Practice Exercises</h2>
<ol>
  <li>Implement a basic version using ${lessonTitle} concepts learned in this lesson</li>
  <li>Create a more complex example with error handling for ${lessonTitle}</li>
  <li>Optimize your ${lessonTitle} solution for better performance</li>
  <li>Add additional features to extend ${lessonTitle} functionality</li>
  <li>Refactor your ${lessonTitle} code following best practices</li>
  <li>Write unit tests for your ${lessonTitle} implementation</li>
  <li>Document your ${lessonTitle} code with clear explanations</li>
</ol>

<h2>📚 Further Learning</h2>
<p>To deepen your understanding of ${lessonTitle}:</p>
<ul>
  <li>Review official documentation and specifications for ${lessonTitle}</li>
  <li>Watch video tutorials and webinars on advanced ${lessonTitle} techniques</li>
  <li>Read blog posts and technical articles about ${lessonTitle} best practices</li>
  <li>Participate in ${category} coding challenges that involve ${lessonTitle}</li>
  <li>Build personal projects using ${lessonTitle} concepts</li>
  <li>Contribute to open-source projects that use ${lessonTitle}</li>
  <li>Join ${category} meetups and conferences to learn from experts</li>
</ul>

<h2>📝 Summary</h2>
<p>In this lesson, we covered:</p>
<ul>
  <li>Core concepts and principles of ${lessonTitle}</li>
  <li>Practical examples and implementations of ${lessonTitle}</li>
  <li>Best practices and common patterns for ${lessonTitle}</li>
  <li>Real-world applications and use cases of ${lessonTitle}</li>
  <li>Common mistakes in ${lessonTitle} and how to avoid them</li>
  <li>Advanced techniques and optimization strategies for ${lessonTitle}</li>
</ul>

<p>Continue practicing and applying these ${lessonTitle} concepts to master ${category} development!</p>`;
}

async function enhanceAllCourseContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const courses = await Course.find({ isActive: true });
    console.log(`📚 Found ${courses.length} active courses\n`);

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const course of courses) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📖 ${course.name}`);
      console.log(`${'='.repeat(60)}`);

      let courseUpdated = false;

      // Process each module
      for (const [moduleIdx, module] of (course.modules || []).entries()) {
        console.log(`\n   📑 Module ${moduleIdx + 1}: ${module.title}`);

        // Process each lesson
        for (const [lessonIdx, lesson] of (module.lessons || []).entries()) {
          console.log(`      📝 Lesson ${lessonIdx + 1}: ${lesson.title}`);

          // Skip if already has substantial content
          if (lesson.content && lesson.content.length > 200) {
            console.log('         ✓ Already has comprehensive content');
            totalSkipped++;
            continue;
          }

          // Generate comprehensive content
          const content = generateDetailedContent(
            lesson.title,
            module.title,
            course.name,
            course.category
          );

          lesson.content = content;
          courseUpdated = true;
          totalUpdated++;
          console.log(`         ✅ Content generated (${content.length} chars)`);
        }
      }

      if (courseUpdated) {
        await course.save();
        console.log(`\n   💾 Course updated with new content`);
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 Comprehensive Content Generation Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Lessons enhanced: ${totalUpdated}`);
    console.log(`   Lessons skipped: ${totalSkipped}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
console.log('🚀 Enhancing Course Content with Comprehensive Material\n');
enhanceAllCourseContent();