const { Announcement, User, Course, Notification } = require('../models');

/**
 * Create a new announcement
 * @route POST /api/announcements
 * @access Private (Teacher/Admin only)
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, targetCourses, targetRoles, priority, isPinned } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }
    
    // Get author information
    const author = await User.findById(req.user.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }
    
    // Verify user is a teacher or admin
    if (author.role !== 'teacher' && author.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can create announcements',
      });
    }
    
    // Create announcement
    const announcement = new Announcement({
      title,
      content,
      author: req.user.id,
      targetAudience: targetAudience || 'all',
      targetCourses: targetCourses || [],
      targetRoles: targetRoles || [],
      priority: priority || 'medium',
      isPinned: isPinned || false,
      isPublished: true,
    });
    
    await announcement.save();
    
    // Populate author information
    await announcement.populate('author', 'name email role');
    
    // Determine recipients based on target audience
    let recipients = [];
    
    if (announcement.targetAudience === 'all') {
      // Notify all users except the author
      recipients = await User.find({
        _id: { $ne: req.user.id },
        isActive: true,
      }).select('_id');
    } else if (announcement.targetAudience === 'students') {
      // Notify all students
      recipients = await User.find({
        role: 'student',
        _id: { $ne: req.user.id },
        isActive: true,
      }).select('_id');
    } else if (announcement.targetAudience === 'teachers') {
      // Notify all teachers and admins
      recipients = await User.find({
        role: { $in: ['teacher', 'admin'] },
        _id: { $ne: req.user.id },
        isActive: true,
      }).select('_id');
    } else if (announcement.targetAudience === 'specific_courses') {
      // Notify students enrolled in specific courses
      const courses = await Course.find({
        _id: { $in: announcement.targetCourses },
      }).select('enrolledStudents');
      
      // Get unique student IDs from all courses
      const studentIds = new Set();
      courses.forEach(course => {
        course.enrolledStudents.forEach(studentId => {
          studentIds.add(studentId.toString());
        });
      });
      
      // Exclude the author if they're in the list
      studentIds.delete(req.user.id.toString());
      
      recipients = Array.from(studentIds).map(id => ({ _id: id }));
    }
    
    console.log(`Creating notifications for ${recipients.length} recipients`);
    
    // Create notifications for recipients
    if (recipients.length > 0) {
      const notifications = recipients.map(recipient => ({
        recipient: recipient._id,
        sender: req.user.id,
        type: 'announcement',
        title: 'New Announcement',
        message: `${author.name}: ${announcement.title}`,
        priority: announcement.priority,
        actionUrl: `/announcements/${announcement._id}`,
        actionLabel: 'View Announcement',
      }));
      
      // Insert notifications in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await Notification.insertMany(batch);
      }
      
      console.log(`Created ${notifications.length} notifications`);
    }
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message,
    });
  }
};

/**
 * Get announcements for the current user
 * @route GET /api/announcements
 * @access Private
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Build query based on user role and target audience
    let query = {
      isPublished: true,
    };
    
    if (user.role === 'student') {
      // Students can see announcements targeted to all, students, or their specific courses
      const studentCourses = await Course.find({
        enrolledStudents: userId,
      }).select('_id');
      
      const courseIds = studentCourses.map(course => course._id);
      
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { 
          targetAudience: 'specific_courses',
          targetCourses: { $in: courseIds },
        },
      ];
    } else if (user.role === 'teacher' || user.role === 'admin') {
      // Teachers and admins can see announcements targeted to all, teachers, or their specific courses
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'teachers' },
      ];
      
      // If teacher, also include announcements for courses they teach
      if (user.role === 'teacher') {
        const teacherCourses = await Course.find({
          teacher: userId,
        }).select('_id');
        
        const courseIds = teacherCourses.map(course => course._id);
        if (courseIds.length > 0) {
          query.$or.push({
            targetAudience: 'specific_courses',
            targetCourses: { $in: courseIds },
          });
        }
      }
    }
    
    const announcements = await Announcement.find(query)
      .populate('author', 'name email role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50); // Limit to prevent excessive data
    
    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message,
    });
  }
};

/**
 * Get a specific announcement
 * @route GET /api/announcements/:id
 * @access Private
 */
exports.getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id)
      .populate('author', 'name email role')
      .populate('targetCourses', 'name description');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    
    // Check if user has permission to view this announcement
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    let canView = false;
    
    if (announcement.targetAudience === 'all') {
      canView = true;
    } else if (announcement.targetAudience === 'students' && user.role === 'student') {
      canView = true;
    } else if (announcement.targetAudience === 'teachers' && (user.role === 'teacher' || user.role === 'admin')) {
      canView = true;
    } else if (announcement.targetAudience === 'specific_courses') {
      // Check if user is enrolled in or teaches one of the target courses
      const courseCheck = await Course.findOne({
        _id: { $in: announcement.targetCourses },
        $or: [
          { enrolledStudents: userId },
          { teacher: userId },
        ],
      });
      
      if (courseCheck) {
        canView = true;
      }
    }
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this announcement',
      });
    }
    
    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message,
    });
  }
};