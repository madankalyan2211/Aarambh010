# PDF Export Testing with CURL-like Approaches

## Important Note
The PDF export functionality is a **frontend-only** feature that runs in the browser using JavaScript. It cannot be directly tested with curl since:

1. It uses browser APIs (Canvas, Blob, etc.)
2. It has no corresponding backend endpoint
3. It generates files client-side

## Alternative Testing Methods

### 1. HTML Test File
Open [curl-pdf-test.html](file:///Users/madanthambisetty/Downloads/Aarambh/curl-pdf-test.html) in your browser to test:
- Basic PDF generation
- Detailed grade report PDF
- Button click functionality

### 2. Node.js Backend Endpoint Testing
Run the Node.js script to test backend endpoints:
```bash
node /Users/madanthambisetty/Downloads/Aarambh/test-backend-endpoints.js
```

This tests related backend endpoints like:
- Health check
- Authentication
- Grades retrieval
- PDF upload

### 3. Actual CURL Commands for Backend Endpoints

#### Health Check
```bash
curl -X GET http://localhost:31001/health
```

#### User Login
```bash
curl -X POST http://localhost:31001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'
```

#### Get Student Grades
```bash
curl -X GET http://localhost:31001/api/student/grades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Upload PDF Assignment
```bash
curl -X POST http://localhost:31001/api/assignments/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "assignmentId=123"
```

## Why the Frontend PDF Export Can't Be Tested with CURL

### Technical Reasons:
1. **Client-Side Execution**: The PDF is generated in the browser using JavaScript
2. **Browser APIs**: Uses Canvas, Blob, and Download APIs not available in server environments
3. **No HTTP Endpoint**: There's no `/api/export-pdf` endpoint to call
4. **UI Interaction**: Requires button click events and DOM manipulation

### What Actually Happens:
1. User clicks "Export PDF" button
2. JavaScript in the browser:
   - Collects grade data
   - Uses jsPDF library to create PDF
   - Triggers file download via browser APIs
3. PDF is downloaded directly to user's computer

## Testing the Actual PDF Export Functionality

### Method 1: Browser Console Testing
```javascript
// Test if jsPDF is working
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.text('Test', 10, 10);
doc.save('test.pdf');
```

### Method 2: Manual Function Call
```javascript
// If you can access the React component methods
// This would depend on how the app is structured
```

## Summary

While you can't test the PDF export button with curl, you can:
1. Test related backend endpoints with curl
2. Test PDF generation in the browser directly
3. Use the provided HTML test file for full functionality testing

The HTML test file ([curl-pdf-test.html](file:///Users/madanthambisetty/Downloads/Aarambh/curl-pdf-test.html)) is the closest equivalent to "curl testing" for this frontend feature.