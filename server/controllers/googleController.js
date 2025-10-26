const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.FRONTEND_URL || 'http://localhost:5174'}/api/google/auth/google/callback`
);

/**
 * Initiate Google OAuth flow
 */
exports.googleLogin = async (req, res) => {
  try {
    const redirectURL = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });
    
    // Redirect to Google OAuth
    res.redirect(redirectURL);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating Google login',
      error: error.message,
    });
  }
};

/**
 * Handle Google OAuth callback
 */
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }
    
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    
    // Get user info from Google
    const userInfoResponse = await googleClient.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });
    
    const googleUser = userInfoResponse.data;
    
    // Create or update user in our database
    const user = await createOrUpdateGoogleUser(googleUser);
    
    // Generate JWT token (using the same structure as regular auth)
    const token = jwt.sign(
      { id: user._id }, // Use 'id' to match the auth middleware expectation
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Redirect back to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }))}`);
    
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Google callback',
      error: error.message,
    });
  }
};

/**
 * Create or update user from Google data
 */
const createOrUpdateGoogleUser = async (googleUser) => {
  try {
    // Check if user exists in our database
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.sub }
      ]
    }).populate('enrolledTeachers', 'name email')
      .populate('students', 'name email')
      .populate('enrolledCourses')
      .populate('teachingCourses');
    
    if (!user) {
      // Create new user if not exists
      user = new User({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        role: 'student', // Default role
        isVerified: true, // Google users are considered verified
        googleId: googleUser.sub,
        password: 'google-user' // Placeholder password for Google users
      });
      
      // Initialize relationship fields for students
      user.enrolledTeachers = [];
      user.enrolledCourses = [];
      user.students = [];
      user.teachingCourses = [];
      
      await user.save();
      
      // Re-fetch user with populated data
      user = await User.findById(user._id)
        .populate('enrolledTeachers', 'name email')
        .populate('students', 'name email')
        .populate('enrolledCourses')
        .populate('teachingCourses');
    } else {
      // Update user with Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
      
      // Ensure relationship fields are initialized
      let needsSave = false;
      if (user.role === 'student') {
        if (!user.enrolledTeachers) {
          user.enrolledTeachers = [];
          needsSave = true;
        }
        if (!user.enrolledCourses) {
          user.enrolledCourses = [];
          needsSave = true;
        }
      } else if (user.role === 'teacher') {
        if (!user.students) {
          user.students = [];
          needsSave = true;
        }
        if (!user.teachingCourses) {
          user.teachingCourses = [];
          needsSave = true;
        }
      }
      
      if (needsSave) {
        await user.save();
        console.log('Initialized relationship fields for Google user:', user.email);
        
        // Re-fetch user with populated data
        user = await User.findById(user._id)
          .populate('enrolledTeachers', 'name email')
          .populate('students', 'name email')
          .populate('enrolledCourses')
          .populate('teachingCourses');
      }
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error creating/updating Google user: ${error.message}`);
  }
};