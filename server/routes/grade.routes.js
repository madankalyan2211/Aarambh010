const express = require('express');
const router = express.Router();
const {
  getStudentGrades,
  getTeacherGrades,
  getStudentGradeReport,
} = require('../controllers/gradeController');
const { protect, isVerified, restrictTo } = require('../middleware/auth');

// All routes require authentication and verification
router.use(protect);
router.use(isVerified);

// Student routes
router.get('/student', restrictTo('student'), getStudentGrades);

// Teacher routes
router.get('/teacher', restrictTo('teacher', 'admin'), getTeacherGrades);
router.get('/student/:studentId/course/:courseId', restrictTo('teacher', 'admin'), getStudentGradeReport);

module.exports = router;
