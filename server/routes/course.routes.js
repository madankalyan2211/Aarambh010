const express = require('express');
const {
  getPublicCourses,
  getAllCourses,
  getTeacherCourses,
  addTeachingCourse,
  removeTeachingCourse,
  getCourseContent,
  getEnrolledCourses,
  enrollInCourse,
  unenrollFromCourse,
  updateCourseContent, // Add this import
  addModule, // Add this import
  updateModule, // Add this import
  deleteModule, // Add this import
  addLesson, // Add this import
  updateLesson, // Add this import
  deleteLesson, // Add this import
  uploadLessonVideo, // Add this import
  uploadLessonPDF, // Add this import
  generateLessonSummary, // Add this import
} = require('../controllers/courseController');
const { protect, restrictTo, isVerified } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Add upload middleware

const router = express.Router();

// Public route - no authentication required
router.get('/public', getPublicCourses);

// Protected routes - require authentication
router.use(protect);
router.use(isVerified);

// Get all courses (with enrollment status for authenticated users)
router.get('/', getAllCourses);

// Get course content (students and teachers)
router.get('/:courseId/content', getCourseContent);

// Generate AI summary for a lesson
router.get('/:courseId/modules/:moduleId/lessons/:lessonId/summary', generateLessonSummary);

// Student-specific routes
router.get('/enrolled', restrictTo('student'), getEnrolledCourses); // Get student's enrolled courses
router.post('/enroll', restrictTo('student'), enrollInCourse); // Student enrolls in course
router.post('/unenroll', restrictTo('student'), unenrollFromCourse); // Student unenrolls

// Teacher-specific routes
router.get('/teaching', restrictTo('teacher', 'admin'), getTeacherCourses);
router.post('/add-teaching', restrictTo('teacher'), addTeachingCourse); // Teacher adds course to teach
router.post('/remove-teaching', restrictTo('teacher'), removeTeachingCourse); // Teacher removes course

// Teacher course content management routes
router.put('/:courseId/content', restrictTo('teacher'), updateCourseContent); // Update course content
router.post('/:courseId/modules', restrictTo('teacher'), addModule); // Add module to course
router.put('/:courseId/modules/:moduleId', restrictTo('teacher'), updateModule); // Update module
router.delete('/:courseId/modules/:moduleId', restrictTo('teacher'), deleteModule); // Delete module
router.post('/:courseId/modules/:moduleId/lessons', restrictTo('teacher'), addLesson); // Add lesson to module
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', restrictTo('teacher'), updateLesson); // Update lesson
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', restrictTo('teacher'), deleteLesson); // Delete lesson

// Video upload route
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/upload-video', 
  restrictTo('teacher'), 
  upload.single('video'), 
  uploadLessonVideo
);

// PDF upload route
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/upload-pdf', 
  restrictTo('teacher'), 
  upload.single('pdf'), 
  uploadLessonPDF
);

module.exports = router;