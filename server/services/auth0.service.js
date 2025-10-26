const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Create or update user from Auth0 data
 */
exports.createOrUpdateAuth0User = async (auth0User) => {
  try {
    // Check if user exists in our database
    let user = await User.findOne({ email: auth0User.email });
    
    if (!user) {
      // Create new user if not exists
      user = new User({
        name: auth0User.name || auth0User.email.split('@')[0],
        email: auth0User.email,
        role: 'student', // Default role
        isVerified: true, // Auth0 users are considered verified
        auth0Id: auth0User.sub,
        password: 'auth0-user', // Placeholder password for Auth0 users
      });
      
      await user.save();
    } else {
      // Update user with Auth0 ID if not already set
      if (!user.auth0Id) {
        user.auth0Id = auth0User.sub;
        await user.save();
      }
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error creating/updating Auth0 user: ${error.message}`);
  }
};

/**
 * Generate JWT token for Auth0 user
 */
exports.generateAuth0Token = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: '7d' }
  );
};

/**
 * Get user by Auth0 ID
 */
exports.getUserByAuth0Id = async (auth0Id) => {
  return await User.findOne({ auth0Id });
};

/**
 * Get user by email (for Auth0 users)
 */
exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Update user role
 */
exports.updateUserRole = async (email, role) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.role = role;
    await user.save();
    
    return user;
  } catch (error) {
    throw new Error(`Error updating user role: ${error.message}`);
  }
};