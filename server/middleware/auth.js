const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔍 Auth middleware - Token present:', !!token);
    
    if (!token) {
      console.log('❌ Auth middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      console.log('🔍 Auth middleware - Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Auth middleware - Token verified, user ID:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('enrolledTeachers', 'name email')
        .populate('students', 'name email')
        .populate('enrolledCourses')
        .populate('teachingCourses');

      if (!req.user) {
        console.log('❌ Auth middleware - User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!req.user.isActive) {
        console.log('❌ Auth middleware - User account deactivated:', req.user.email);
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      console.log('✅ Auth middleware - User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.log('❌ Auth middleware - Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is verified
exports.isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this route',
    });
  }
  next();
};