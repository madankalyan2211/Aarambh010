const { User, Course, Assignment, Submission, Discussion } = require('../models');

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for different entities
    const userCount = await User.countDocuments({ isActive: true });
    const courseCount = await Course.countDocuments({ isActive: true });
    const assignmentCount = await Assignment.countDocuments();
    
    // Calculate engagement rate (simplified)
    const activeUsers = await User.countDocuments({ 
      isActive: true, 
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    const engagementRate = userCount > 0 ? Math.round((activeUsers / userCount) * 100) : 0;
    
    // Get flagged items (simplified - could be expanded)
    const flaggedSubmissions = await Submission.countDocuments({ 
      flagged: true 
    });
    
    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        userCount,
        courseCount,
        assignmentCount,
        engagementRate,
        flaggedSubmissions
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard stats',
      error: error.message,
    });
  }
};

/**
 * Get daily active users data for the last 7 days
 * @route GET /api/admin/analytics/daily-active-users
 * @access Private (Admin only)
 */
exports.getDailyActiveUsers = async (req, res) => {
  try {
    const days = 7;
    const userData = [];
    
    // Get data for each of the last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - i);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      const userCount = await User.countDocuments({
        lastLogin: {
          $gte: startDate,
          $lt: endDate
        },
        isActive: true
      });
      
      // Get day name (e.g., "Mon", "Tue")
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[startDate.getDay()];
      
      userData.push({
        date: dayName,
        users: userCount
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Daily active users data retrieved successfully',
      data: userData,
    });
  } catch (error) {
    console.error('Get daily active users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving daily active users data',
      error: error.message,
    });
  }
};

/**
 * Get course enrollment trend data for the last 6 months
 * @route GET /api/admin/analytics/enrollment-trend
 * @access Private (Admin only)
 */
exports.getEnrollmentTrend = async (req, res) => {
  try {
    const months = 6;
    const enrollmentData = [];
    
    // For now, we'll use a simplified approach to show enrollment trends
    // In a production system, you would want to track actual enrollment dates
    
    // Get all courses with their enrollment counts
    const courses = await Course.find({ isActive: true })
      .select('enrolledStudents createdAt');
    
    // Get data for each of the last 6 months
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      targetDate.setDate(1); // First day of the month
      targetDate.setHours(0, 0, 0, 0);
      
      // Count courses that existed by this date
      const coursesByDate = courses.filter(course => 
        course.createdAt <= targetDate
      );
      
      // Sum up enrollments for all courses that existed by this date
      let totalEnrollments = 0;
      coursesByDate.forEach(course => {
        totalEnrollments += course.enrolledStudents.length;
      });
      
      // Get month name (e.g., "Jan", "Feb")
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[targetDate.getMonth()];
      
      enrollmentData.push({
        month: monthName,
        enrolled: totalEnrollments
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Enrollment trend data retrieved successfully',
      data: enrollmentData,
    });
  } catch (error) {
    console.error('Get enrollment trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving enrollment trend data',
      error: error.message,
    });
  }
};

/**
 * Get all users for admin management
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email role isVerified createdAt lastLogin enrolledCourses teachingCourses')
      .populate('enrolledCourses', '_id')
      .populate('teachingCourses', '_id')
      .sort({ createdAt: -1 });
    
    // Transform user data for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isVerified ? 'Active' : 'Pending',
      enrolled: user.role === 'student' && user.enrolledCourses ? user.enrolledCourses.length : 0,
      courses: user.role === 'teacher' && user.teachingCourses ? user.teachingCourses.length : 0,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: transformedUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

/**
 * Get all courses for admin management
 * @route GET /api/admin/courses
 * @access Private (Admin only)
 */
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    
    // Transform course data for frontend
    const transformedCourses = courses.map(course => ({
      id: course._id,
      name: course.name,
      students: course.enrolledStudents ? course.enrolledStudents.length : 0,
      teacher: course.teacher ? course.teacher.name : 'Unknown',
      status: course.isActive ? 'Active' : 'Inactive',
      createdAt: course.createdAt
    }));
    
    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: transformedCourses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving courses',
      error: error.message,
    });
  }
};

/**
 * Delete a user by ID
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deletion of admin users
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (userToDelete.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

/**
 * Get system health information
 * @route GET /api/admin/system-health
 * @access Private (Admin only)
 */
exports.getSystemHealth = async (req, res) => {
  try {
    // Get database stats
    const dbStats = await require('mongoose').connection.db.stats();
    
    // Get user session stats
    const activeSessions = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });
    
    res.status(200).json({
      success: true,
      message: 'System health retrieved successfully',
      data: {
        uptime: process.uptime(),
        dbStats,
        activeSessions,
        serverTime: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system health',
      error: error.message,
    });
  }
};

/**
 * Get flagged submissions for cheat detection
 * @route GET /api/admin/flagged-submissions
 * @access Private (Admin only)
 */
exports.getFlaggedSubmissions = async (req, res) => {
  try {
    // Get flagged submissions with populated data
    const flaggedSubmissions = await Submission.find({ 
      isFlagged: true 
    })
    .populate('student', 'name email')
    .populate('assignment', 'title course')
    .populate('course', 'name')
    .sort({ submittedAt: -1 })
    .limit(50); // Limit to 50 most recent flagged submissions
    
    // Transform data for frontend
    const transformedSubmissions = flaggedSubmissions.map(submission => ({
      id: submission._id,
      student: {
        id: submission.student._id,
        name: submission.student.name,
        email: submission.student.email
      },
      assignment: {
        id: submission.assignment._id,
        title: submission.assignment.title,
        course: submission.assignment.course
      },
      course: {
        id: submission.course._id,
        name: submission.course.name
      },
      flagReason: submission.flagReason,
      aiDetectionScore: submission.aiDetectionScore,
      plagiarismScore: submission.plagiarismScore,
      submittedAt: submission.submittedAt,
      riskLevel: submission.plagiarismScore > 0.8 || submission.aiDetectionScore > 0.8 
        ? 'High' 
        : submission.plagiarismScore > 0.5 || submission.aiDetectionScore > 0.5 
        ? 'Medium' 
        : 'Low'
    }));
    
    res.status(200).json({
      success: true,
      message: 'Flagged submissions retrieved successfully',
      data: transformedSubmissions,
    });
  } catch (error) {
    console.error('Get flagged submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving flagged submissions',
      error: error.message,
    });
  }
};

/**
 * Create a new user
 * @route POST /api/admin/users
 * @access Private (Admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isVerified: true, // Admin-created users are automatically verified
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isVerified ? 'Active' : 'Pending',
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

/**
 * Create a new course
 * @route POST /api/admin/courses
 * @access Private (Admin only)
 */
exports.createCourse = async (req, res) => {
  try {
    const { name, description, category, difficulty, maxStudents } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required',
      });
    }

    // Create new course
    const course = await Course.create({
      name,
      description,
      category: category || 'General',
      difficulty: difficulty || 'Beginner',
      maxStudents: maxStudents || 100,
      isPublished: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        id: course._id,
        name: course.name,
        students: 0,
        teacher: 'Unassigned',
        status: 'Active',
        createdAt: course.createdAt,
      },
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message,
    });
  }
};

/**
 * Delete a course by ID
 * @route DELETE /api/admin/courses/:id
 * @access Private (Admin only)
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const courseToDelete = await Course.findById(id);
    if (!courseToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Remove course reference from users (both enrolled students and teachers)
    // Remove from enrolled students
    await User.updateMany(
      { enrolledCourses: id },
      { $pull: { enrolledCourses: id } }
    );
    
    // Remove from teachers
    await User.updateMany(
      { teachingCourses: id },
      { $pull: { teachingCourses: id } }
    );
    
    // Delete related assignments
    await Assignment.deleteMany({ course: id });
    
    // Delete related discussions
    await Discussion.deleteMany({ course: id });
    
    // Delete the course
    await Course.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};