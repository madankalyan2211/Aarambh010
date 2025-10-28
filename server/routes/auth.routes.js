const express = require('express');
const { generateOTP, storeOTP, verifyOTP: verifyOTPService, hasValidOTP, getOTPInfo } = require('../services/otp.service.js');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/email.service.js');
const { register, login, verifyOTP: verifyOTPController, resendOTP: resendOTPController, getCurrentUser, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// MongoDB-based authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp-db', verifyOTPController); // Renamed to avoid conflict
router.post('/resend-otp-db', resendOTPController); // Renamed to avoid conflict
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

// Test endpoint to verify email sending functionality
router.post('/test-registration', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Import the email service
    const { sendOTPEmail } = require('../services/email.service.js');
    
    // Send test email using the existing email service
    const result = await sendOTPEmail(email, 'TEST123', name);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        consoleOnly: result.consoleOnly
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error sending test email',
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Hybrid login endpoint - allows login for users verified in MongoDB even without Firebase credentials
router.post('/hybrid-login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    
    // Get user from database
    const { User } = require('../models');
    const bcrypt = require('bcryptjs');
    
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // Check if user has a valid password set
    // Users created through Firebase have a placeholder password
    let isPasswordValid = false;
    if (user.password && user.password !== 'firebase-user') {
      // Check if password is correct
      isPasswordValid = await user.comparePassword(password);
    } else {
      // For users without a proper password (Firebase users), we can't verify the password
      // In a real implementation, you might want to handle this differently
      // For now, we'll reject the login and suggest using Firebase login
      return res.status(401).json({
        success: false,
        message: 'Account was created using a different method. Please use the original login method.',
      });
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before signing in. Check your inbox for the verification email.',
        requiresEmailVerification: true
      });
    }
    
    // Update user role if provided and different
    if (role && user.role !== role) {
      user.role = role;
      await user.save();
      console.log('Updated user role:', user.email, 'to', role);
    }
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );
    
    user.lastLogin = new Date();
    await user.save();
    
    console.log('Hybrid authentication successful for:', user.email);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toPublicProfile()
      }
    });
    
  } catch (error) {
    console.error('Hybrid login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing login',
      error: error.message,
    });
  }
});

// Check if user exists and is verified in MongoDB
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Get user from database
    const { User } = require('../models');
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(200).json({
        success: true,
        user: null,
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
    
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user',
      error: error.message,
    });
  }
});

// Test Firebase configuration
router.get('/test-firebase-config', async (req, res) => {
  try {
    // Check if required environment variables are present
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID', 
      'FIREBASE_CLIENT_EMAIL', 
      'FIREBASE_PRIVATE_KEY'
    ];
    
    const envStatus = {};
    let allPresent = true;
    
    requiredEnvVars.forEach(envVar => {
      envStatus[envVar] = {
        present: !!process.env[envVar],
        value: process.env[envVar] ? 
          (envVar === 'FIREBASE_PRIVATE_KEY' ? '[PRIVATE_KEY_HIDDEN]' : process.env[envVar].substring(0, 50) + '...') : 
          null
      };
      
      if (!process.env[envVar]) {
        allPresent = false;
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Firebase configuration status',
      allVariablesPresent: allPresent,
      environmentVariables: envStatus
    });
  } catch (error) {
    console.error('Firebase config test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing Firebase configuration',
      error: error.message
    });
  }
});

// Firebase authentication callback
router.post('/firebase/callback', async (req, res) => {
  try {
    const { idToken, name, email, uid, role } = req.body;
    
    console.log('Firebase callback received for:', email);
    
    // Verify Firebase ID token
    const admin = require('firebase-admin');
    
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      console.log('Initializing Firebase Admin SDK');
      // Check if required environment variables are present
      const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingEnvVars.length > 0) {
        console.error('Missing Firebase environment variables:', missingEnvVars);
        return res.status(500).json({
          success: false,
          message: 'Firebase configuration error: missing environment variables',
          missingVariables: missingEnvVars
        });
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
    }
    
    // Verify the ID token
    console.log('Verifying Firebase ID token');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Decoded token email verified:', decodedToken.email_verified);
    
    // Get or create user in our database
    const { User } = require('../models');
    const jwt = require('jsonwebtoken');
    
    let user = await User.findOne({ 
      $or: [
        { email: decodedToken.email },
        { firebaseId: decodedToken.uid }
      ]
    }).populate('enrolledTeachers', 'name email')
      .populate('students', 'name email')
      .populate('enrolledCourses')
      .populate('teachingCourses');
    
    console.log('User found in database:', !!user);
    
    // For new students signing up with Google, we still want to ensure they're properly verified
    // But we'll allow the login to proceed as long as they have a valid Firebase token
    const isEmailVerified = decodedToken.email_verified || (user && user.isVerified);
    
    if (!user) {
      // Create new user with the selected role or default to student
      user = new User({
        name: name || decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        role: role || 'student', // Use the selected role or default to student
        isVerified: isEmailVerified, // Set verification status based on Firebase
        firebaseId: decodedToken.uid,
        password: 'firebase-user' // Placeholder password
      });
      
      // Initialize relationship fields based on role
      if (user.role === 'student') {
        user.enrolledTeachers = [];
        user.enrolledCourses = [];
      } else if (user.role === 'teacher') {
        user.students = [];
        user.teachingCourses = [];
      }
      
      await user.save();
      console.log('New user created:', user.email);
      
      // Re-fetch user with populated data
      user = await User.findById(user._id)
        .populate('enrolledTeachers', 'name email')
        .populate('students', 'name email')
        .populate('enrolledCourses')
        .populate('teachingCourses');
    } else {
      // Update user with Firebase ID if not already set
      if (!user.firebaseId) {
        user.firebaseId = decodedToken.uid;
        await user.save();
        console.log('Updated user with Firebase ID:', user.email);
      }
      // Update user role if provided and different
      if (role && user.role !== role) {
        user.role = role;
        // Initialize relationship fields based on new role
        if (user.role === 'student') {
          if (!user.enrolledTeachers) user.enrolledTeachers = [];
          if (!user.enrolledCourses) user.enrolledCourses = [];
        } else if (user.role === 'teacher') {
          if (!user.students) user.students = [];
          if (!user.teachingCourses) user.teachingCourses = [];
        }
        await user.save();
        console.log('Updated user role:', user.email, 'to', role);
      }
      
      // If user was not previously marked as verified but is now verified via Firebase, update the status
      if (!user.isVerified && decodedToken.email_verified) {
        user.isVerified = true;
        await user.save();
        console.log('Updated user verification status:', user.email);
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
        console.log('Initialized relationship fields for user:', user.email);
        
        // Re-fetch user with populated data
        user = await User.findById(user._id)
          .populate('enrolledTeachers', 'name email')
          .populate('students', 'name email')
          .populate('enrolledCourses')
          .populate('teachingCourses');
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );
    
    user.lastLogin = new Date();
    await user.save();
    
    console.log('Firebase authentication successful for:', user.email);
    
    // Create a more detailed user profile for the frontend
    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      learningStreak: user.learningStreak,
      totalXP: user.totalXP,
      badges: user.badges,
      teachingCourses: user.teachingCourses || [],
      enrolledCourses: user.enrolledCourses || [],
      enrolledTeachers: user.enrolledTeachers || [],
      students: user.students || [],
      createdAt: user.createdAt,
    };
    
    res.status(200).json({
      success: true,
      message: 'Firebase authentication successful',
      data: {
        token,
        user: userProfile
      }
    });
    
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Firebase authentication',
      error: error.message
    });
  }
});

// Legacy OTP routes (for email-based OTP without database)

/**
 * POST /api/auth/send-otp
 * Send OTP to user's email
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }
    
    // Check if there's already a valid OTP
    if (hasValidOTP(email)) {
      const info = getOTPInfo(email);
      return res.status(429).json({
        success: false,
        message: `Please wait ${info.expiresIn} seconds before requesting a new OTP`,
        expiresIn: info.expiresIn,
      });
    }
    
    // Generate OTP
    const otpLength = parseInt(process.env.OTP_LENGTH || '6');
    const otp = generateOTP(otpLength);
    
    // Store OTP
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    storeOTP(email, otp, expiryMinutes);
    
    // Send email
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error,
      });
    }
    
    // Success response
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      email,
      expiresIn: expiryMinutes * 60, // in seconds
    });
    
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP (Legacy - Email-based only)
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }
    
    // Verify OTP using the service function
    const result = verifyOTPService(email, otp);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Success response
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email,
    });
    
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Generate new OTP
    const otpLength = parseInt(process.env.OTP_LENGTH || '6');
    const otp = generateOTP(otpLength);
    
    // Store OTP
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    storeOTP(email, otp, expiryMinutes);
    
    // Send email
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP email',
        error: emailResult.error,
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      email,
      expiresIn: expiryMinutes * 60,
    });
    
  } catch (error) {
    console.error('Error in resend-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/send-welcome
 * Send welcome email after successful registration
 */
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }
    
    const result = await sendWelcomeEmail(email, name);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
      });
    }
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
