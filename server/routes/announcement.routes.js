const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
} = require('../controllers/announcementController');

// Apply authentication middleware to all routes
router.use(protect);

// Create a new announcement (Teacher/Admin only)
router.post('/', createAnnouncement);

// Get announcements for current user
router.get('/', getAnnouncements);

// Get a specific announcement
router.get('/:id', getAnnouncement);

module.exports = router;