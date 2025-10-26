# Video Upload Button Visual Guide

## Where to Find the Button

The video upload button appears in the **Lesson Editor** when you:

1. Log in as a teacher
2. Navigate to a course you're teaching
3. Click "Manage Course"
4. Add or edit a lesson
5. **Select "Video" from the Lesson Type dropdown**

## Visual Layout

When you select "Video" as the lesson type, you'll see this layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Lesson Title                                                │
│ [_____________________________]                             │
│                                                             │
│ Lesson Type                                                 │
│ [Video ▼]                                                   │
│                                                             │
│ Video URL          Upload Video                             │
│ [_______________]  [📁 Upload]                              │
│ ✓ Video uploaded successfully                               │
│ ┌───────────────┐  45%                                       │
│ │■■■■■■■■■■■■■■ │                                            │
│ └───────────────┘                                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Upload Video File                        Max 100MB      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Or select a video file from your computer to upload     │ │
│ │ directly.                                               │ │
│ │                                                         │ │
│ │         [📁 Select Video from Computer]                 │ │
│ │                                                         │ │
│ │         ✓ Video uploaded: sample-video.mp4             │ │
│ │                                                         │ │
│ │ Note:                                                   │ │
│ │ • Supported formats: MP4, MOV, AVI, WMV, FLV            │ │
│ │ • Maximum file size: 100MB                              │ │
│ │ • Save the lesson after uploading                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Content                                                     │
│ [_________________________________________________________] │
│ [_________________________________________________________] │
│ [_________________________________________________________] │
│                                                             │
│ Duration (minutes)                                          │
│ [____]                                                      │
│                                                             │
│ [Cancel] [Save]                                             │
└─────────────────────────────────────────────────────────────┘
```

## Button Details

### 1. Inline Upload Button
- **Location**: Right next to the Video URL input field
- **Text**: "Upload" with a file icon
- **Purpose**: Quick upload without scrolling

### 2. Full Upload Section
- **Location**: Below the URL field in its own section
- **Text**: "Select Video from Computer" with a larger file icon
- **Purpose**: More prominent option with additional information

## What Happens When You Click

1. **Clicking either upload button**:
   - Opens file selection dialog
   - Only shows video files (.mp4, .mov, .avi, etc.)

2. **After selecting a file**:
   - Upload begins immediately
   - Progress bar shows upload status
   - Percentage indicator updates in real-time

3. **When upload completes**:
   - Video URL field is automatically populated
   - Green success message appears
   - Filename shown in the upload section

## Common Mistakes

### Mistake 1: Looking in the Wrong Place
- **Wrong**: Looking for the button on the course listing page
- **Right**: Look in the lesson editor after selecting "Video" type

### Mistake 2: Not Selecting "Video" Type
- **Wrong**: Expecting to see upload options with "Text" type
- **Right**: Change lesson type to "Video" first

### Mistake 3: Not Saving the Lesson
- **Wrong**: Thinking upload failed because video doesn't appear immediately
- **Right**: Click "Save" after uploading to make the video available to students

## Browser Support

The upload button works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

If you're using an older browser, consider updating for the best experience.