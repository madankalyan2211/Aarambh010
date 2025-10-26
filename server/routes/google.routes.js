const express = require('express');
const { googleCallback, googleLogin } = require('../controllers/googleController');

const router = express.Router();

// Google OAuth routes
router.get('/auth/google', googleLogin);
router.get('/auth/google/callback', googleCallback);

module.exports = router;