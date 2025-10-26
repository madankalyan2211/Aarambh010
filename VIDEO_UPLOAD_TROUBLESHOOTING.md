# Video Upload Button Troubleshooting Guide

If you're not seeing the "Select Video from Computer" button in the Aarambh application, follow these steps to troubleshoot:

## 1. Verify You're Logged in as a Teacher

The video upload feature is only available to teachers. Make sure you're logged in with teacher credentials.

## 2. Navigate to the Correct Section

Follow these steps to access the video upload button:

1. Log in to the application at http://localhost:5177
2. Go to the "Courses" tab
3. Find a course you're teaching or create a new course
4. Click "Manage Course" for that course
5. Add a new module or use an existing one
6. Add a new lesson or edit an existing lesson
7. In the lesson editor, change the "Lesson Type" to "Video"

## 3. Check Browser Console for Errors

Open your browser's developer tools (F12) and check the console for any JavaScript errors that might prevent the button from rendering.

## 4. Clear Browser Cache

Sometimes caching issues can prevent new features from appearing:
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear your browser cache
- Try in an incognito/private browsing window

## 5. Verify the Development Servers are Running

Make sure both frontend and backend servers are running:
- Frontend: http://localhost:5177
- Backend: http://localhost:31002

## 6. Check the Lesson Type Selection

The video upload button only appears when you select "Video" as the lesson type:
- Look for the "Lesson Type" dropdown in the lesson editor
- Select "Video" from the options (Text, Video, PDF)
- The video upload section should appear below the dropdown

## 7. Test with the Demo Files

You can verify the button works correctly by opening these demo files in your browser:
- `video-button-demo.html` - Shows the exact button styling
- `video-upload-test.html` - Interactive demo of the upload functionality

## 8. Check Component Rendering

If you're a developer and want to verify the component is rendering:
1. Open browser developer tools
2. Go to the Components tab (if using React DevTools)
3. Look for the LessonForm component
4. Check if it's receiving "video" as the type prop

## 9. Verify File Permissions

Make sure the file `/src/components/TeacherCourseContentPage.tsx` has the correct permissions and hasn't been corrupted.

## 10. Restart Development Servers

If none of the above works:
1. Stop both frontend and backend servers
2. Clear the Vite cache: `rm -rf node_modules/.vite`
3. Restart the backend server: `cd server && npm start`
4. Restart the frontend server: `npm run dev`

If you're still experiencing issues after following these steps, please provide:
1. Screenshots of the page where you expect to see the button
2. Browser console errors (if any)
3. Steps you took to navigate to that page

### Solution
1. Check that all the required files exist and are properly configured:
   - `/server/controllers/courseController.js`
   - `/server/routes/course.routes.js`
   - `/server/middleware/upload.js`
   - `/src/components/TeacherCourseContentPage.tsx`