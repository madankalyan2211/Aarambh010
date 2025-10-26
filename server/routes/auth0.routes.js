const express = require('express');
const { auth0Callback, getAuth0User, auth0Logout, enableMFA, disableMFA, checkMFA, updateUserRole } = require('../controllers/auth0Controller');
const { requiresAuth } = require('express-openid-connect');

const router = express.Router();

// Auth0 callback endpoint
router.get('/callback', auth0Callback);

// Get current user (protected route)
router.get('/me', requiresAuth(), getAuth0User);

// Logout endpoint
router.post('/logout', auth0Logout);

// MFA endpoints
router.post('/mfa/enable', enableMFA);
router.post('/mfa/disable', disableMFA);
router.get('/mfa/check', checkMFA);

// User role management
router.post('/role/update', updateUserRole);

module.exports = router;