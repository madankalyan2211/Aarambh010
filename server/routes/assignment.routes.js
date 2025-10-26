const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createAssignment,
  getStudentAssignments,
  getTeacherAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  aiGradeSubmission
} = require('../controllers/assignmentController');
const { protect, isVerified, restrictTo } = require('../middleware/auth');

// All routes require authentication and verification
router.use(protect);
router.use(isVerified);

// Student routes
router.get('/student', restrictTo('student'), getStudentAssignments);
router.post('/submit', restrictTo('student'), upload.array('attachments', 5), submitAssignment);

// Teacher routes
router.post('/create', restrictTo('teacher', 'admin'), createAssignment);
router.get('/teacher', restrictTo('teacher', 'admin'), getTeacherAssignments);
router.get('/:assignmentId/submissions', restrictTo('teacher', 'admin'), getAssignmentSubmissions);
router.post('/grade/:submissionId', restrictTo('teacher', 'admin'), gradeSubmission);
router.post('/ai-grade/:submissionId', restrictTo('teacher', 'admin'), express.json(), aiGradeSubmission);

module.exports = router;