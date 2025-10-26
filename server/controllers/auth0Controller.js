const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createOrUpdateAuth0User, generateAuth0Token } = require('../services/auth0.service');

/**
 * Handle Auth0 login callback
 */
exports.auth0Callback = async (req, res) => {
  try {
    // Get user info from Auth0
    const auth0User = req.oidc.user;
    
    if (!auth0User) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }
    
    // Create or update user in our database
    const user = await createOrUpdateAuth0User(auth0User);
    
    // Generate JWT token
    const token = generateAuth0Token(user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Auth0 callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during authentication',
      error: error.message,
    });
  }
};

/**
 * Get current user profile for Auth0 authenticated users
 */
exports.getAuth0User = async (req, res) => {
  try {
    // For Auth0 users, we can get user info from the token
    const auth0User = req.oidc.user;
    
    if (!auth0User) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Find user in our database
    const user = await User.findOne({ email: auth0User.email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get Auth0 user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

/**
 * Handle Auth0 logout
 */
exports.auth0Logout = (req, res) => {
  // Perform local logout
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Enable MFA for a user
 */
exports.enableMFA = async (req, res) => {
  try {
    // In a real implementation, you would use the Auth0 Management API
    // to enable MFA for the user. For now, we'll just update our local database.
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Find user in our database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // In a real implementation, you would call the Auth0 Management API
    // to enable MFA for the user. For now, we'll just set a flag in our database.
    user.mfaEnabled = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully',
    });
  } catch (error) {
    console.error('Enable MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enabling MFA',
      error: error.message,
    });
  }
};

/**
 * Disable MFA for a user
 */
exports.disableMFA = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Find user in our database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // In a real implementation, you would call the Auth0 Management API
    // to disable MFA for the user. For now, we'll just set a flag in our database.
    user.mfaEnabled = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling MFA',
      error: error.message,
    });
  }
};

/**
 * Check if MFA is enabled for a user
 */
exports.checkMFA = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    
    // Find user in our database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        mfaEnabled: user.mfaEnabled || false,
      },
    });
  } catch (error) {
    console.error('Check MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking MFA status',
      error: error.message,
    });
  }
};

/**
 * Update user role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required',
      });
    }
    
    // Validate role
    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: student, teacher, admin',
      });
    }
    
    // Find user in our database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message,
    });
  }
};