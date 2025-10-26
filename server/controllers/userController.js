const { User } = require('../models');

/**
 * Search users by email or name
 * @route GET /api/users/search
 * @access Private
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    // Search for users by email or name (case insensitive)
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ],
      isVerified: true,
      isActive: true
    })
    .select('name email role avatar bio')
    .limit(20); // Limit to 20 results
    
    res.status(200).json({
      success: true,
      message: 'Users found',
      data: users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message,
    });
  }
};