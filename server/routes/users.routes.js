const express = require('express');
const { protect } = require('../middleware/auth');
const { searchUsers } = require('../controllers/userController');

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

// Search users by email or name
router.get('/search', searchUsers);

module.exports = router;