const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboardStats,
  getDailyActiveUsers,
  getEnrollmentTrend,
  getUsers,
  getCourses,
  getSystemHealth,
  deleteUser,
  deleteCourse,
  createUser,
  createCourse,
  getFlaggedSubmissions
} = require('../controllers/adminController');

// Apply authentication middleware to all routes
router.use(protect);

// Admin-only routes
router.use(restrictTo('admin'));

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Analytics routes
router.get('/analytics/daily-active-users', getDailyActiveUsers);
router.get('/analytics/enrollment-trend', getEnrollmentTrend);

// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

// Course management
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);

// Flagged submissions for cheat detection
router.get('/flagged-submissions', getFlaggedSubmissions);

// Get system health
router.get('/system-health', getSystemHealth);

module.exports = router;