# How to Find the Video Upload Button

If you're not seeing the video upload button, follow these steps to locate it:

## Step-by-Step Navigation

1. **Login as a Teacher**
   - Open your browser and go to http://localhost:5177
   - Login with teacher credentials (if you don't have any, you may need to register as a teacher first)

2. **Navigate to Courses**
   - After logging in, you should see the Teacher Dashboard
   - Look for a "Courses" or "My Courses" tab/link and click it

3. **Select or Create a Course**
   - You should see a list of courses you're teaching
   - Either click on an existing course or create a new one

4. **Manage the Course**
   - Look for a "Manage Course" or "Edit Course" button for the selected course
   - Click on it to enter the course management interface

5. **Add or Edit a Lesson**
   - In the course management view, you'll see modules and lessons
   - Either:
     - Click "Add Lesson" to create a new lesson, OR
     - Click "Edit" on an existing lesson

6. **Select Video as Lesson Type**
   - In the lesson editor, look for a "Lesson Type" dropdown
   - Change the type from "Text" to "Video"
   - **This is the crucial step** - the video upload section only appears when you select "Video"

## What You Should See

After selecting "Video" as the lesson type, you should see:

1. **Video URL Input Field** - with an "Upload Video" button next to it
2. **Upload Video File Section** - with a larger "Select Video from Computer" button

## Common Issues

### Issue 1: Not Logged in as Teacher
- **Symptom**: You don't see teacher-specific options
- **Solution**: Make sure you're logged in with teacher credentials

### Issue 2: Not in the Right Section
- **Symptom**: You see course listings but no "Manage Course" option
- **Solution**: Look for a "Manage" or "Edit" button next to the course

### Issue 3: Haven't Selected "Video" Type
- **Symptom**: You see text input but no video upload options
- **Solution**: Find the "Lesson Type" dropdown and select "Video"

### Issue 4: Browser Cache Issue
- **Symptom**: The interface looks outdated
- **Solution**: 
  1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
  2. Clear browser cache
  3. Try in an incognito/private window

### Issue 5: Development Server Issues
- **Symptom**: Page doesn't load or loads with errors
- **Solution**:
  1. Check that both frontend (port 5177) and backend (port 31002) servers are running
  2. Check browser console for errors

## Visual Confirmation

You can verify the button works by opening this file in your browser:
`video-upload-demo.html`

This will show you exactly what the button should look like.

## Need More Help?

If you're still having trouble, please provide:
1. Screenshots of the page where you expect to see the button
2. Browser console errors (press F12 to open developer tools)
3. The exact steps you took to navigate to that page