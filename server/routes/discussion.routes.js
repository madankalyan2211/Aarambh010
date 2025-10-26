const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Get all discussions for a course
router.get('/course/:courseId', discussionController.getCourseDiscussions);

// Create a new discussion
router.post('/', discussionController.createDiscussion);

// Get all global discussions (visible to all users)
router.get('/global', discussionController.getGlobalDiscussions);

// Create a new global discussion (visible to all users)
router.post('/global', discussionController.createGlobalDiscussion);

// Get top contributors
router.get('/contributors/top', discussionController.getTopContributors);

// Get a single discussion
router.get('/:discussionId', discussionController.getDiscussion);

// Add a reply to a discussion
router.post('/:discussionId/reply', discussionController.addReply);

// Like/unlike a discussion
router.post('/:discussionId/like', discussionController.likeDiscussion);

module.exports = router;