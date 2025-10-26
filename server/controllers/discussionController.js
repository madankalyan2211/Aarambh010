const Discussion = require('../models/Discussion');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

/**
 * Get top contributors based on discussion activity
 */
exports.getTopContributors = async (req, res) => {
  try {
    // Aggregate to get top contributors by discussion count
    const contributors = await User.aggregate([
      {
        $lookup: {
          from: 'discussions',
          localField: '_id',
          foreignField: 'author',
          as: 'discussions'
        }
      },
      {
        $lookup: {
          from: 'discussions',
          localField: '_id',
          foreignField: 'replies.author',
          as: 'replies'
        }
      },
      {
        $addFields: {
          totalPosts: {
            $add: [
              { $size: '$discussions' },
              { $size: '$replies' }
            ]
          }
        }
      },
      {
        $match: {
          totalPosts: { $gt: 0 }
        }
      },
      {
        $sort: {
          totalPosts: -1
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          totalPosts: 1
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Top contributors retrieved successfully',
      data: contributors
    });
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top contributors',
      error: error.message
    });
  }
};

/**
 * Get all global discussions (visible to all users)
 */
exports.getGlobalDiscussions = async (req, res) => {
  try {
    // Get all discussions without course filtering
    const discussions = await Discussion.find({})
      .populate('author', 'name email role')
      .populate('replies.author', 'name email role')
      .populate('likes', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Global discussions retrieved successfully',
      data: discussions
    });
  } catch (error) {
    console.error('Error fetching global discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global discussions',
      error: error.message
    });
  }
};

/**
 * Create a new global discussion (visible to all users)
 */
exports.createGlobalDiscussion = async (req, res) => {
  try {
    const { title, content, college } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Creating global discussion with data:', {
      title,
      content,
      college,
      author: req.user.id,
      category: 'global',
      tags: ['global']
    });
    
    // Prepare tags array
    const tags = ['global'];
    if (college) {
      tags.push(college);
    }
    
    // Create global discussion (no course association)
    const discussion = new Discussion({
      title,
      content,
      college: college || undefined,
      author: req.user.id,
      category: 'global',
      tags
    });
    
    console.log('Discussion object created, saving...');
    await discussion.save();
    console.log('Discussion saved successfully');
    
    // Populate author information
    await discussion.populate('author', 'name email role');
    
    // For global discussions, notify all users
    const allUsers = await User.find({
      _id: { $ne: req.user.id } // Don't notify the author
    });
    
    console.log('Found', allUsers.length, 'users to notify');
    
    // Create notifications
    const notifications = allUsers.map(recipient => ({
      recipient: recipient._id,
      sender: req.user.id,
      type: 'global_discussion',
      title: 'New Global Discussion',
      message: `${user.name} started a new global discussion: "${title}"`,
      relatedDiscussion: discussion._id
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      success: true,
      message: 'Global discussion created successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Error creating global discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create global discussion',
      error: error.message
    });
  }
};

/**
 * Get all discussions for a course
 */
exports.getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { category } = req.query;
    
    // Verify user is enrolled in or teaching the course
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is enrolled in or teaching this course
    const isEnrolled = user.enrolledCourses && user.enrolledCourses.includes(courseId);
    const isTeaching = user.taughtCourses && user.taughtCourses.includes(courseId);
    
    if (!isEnrolled && !isTeaching) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view discussions for this course'
      });
    }
    
    // Build query
    let query = { course: courseId };
    if (category) {
      query.category = category;
    }
    
    // Get discussions with author and reply authors populated
    const discussions = await Discussion.find(query)
      .populate('author', 'name email role')
      .populate('replies.author', 'name email role')
      .populate('likes', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Discussions retrieved successfully',
      data: discussions
    });
  } catch (error) {
    console.error('Error fetching course discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
};

/**
 * Create a new discussion
 */
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, courseId, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !content || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and courseId are required'
      });
    }
    
    // Verify user is enrolled in or teaching the course
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is enrolled in or teaching this course
    const isEnrolled = user.enrolledCourses && user.enrolledCourses.includes(courseId);
    const isTeaching = user.taughtCourses && user.taughtCourses.includes(courseId);
    
    if (!isEnrolled && !isTeaching) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create discussions for this course'
      });
    }
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Create discussion
    const discussion = new Discussion({
      title,
      content,
      author: req.user.id,
      course: courseId,
      category: category || 'discussion',
      tags: tags || []
    });
    
    await discussion.save();
    
    // Populate author information
    await discussion.populate('author', 'name email role');
    
    // Create notification for students and teachers in the course
    const courseStudents = await User.find({
      enrolledCourses: courseId,
      _id: { $ne: req.user.id } // Don't notify the author
    });
    
    const courseTeachers = await User.find({
      taughtCourses: courseId,
      _id: { $ne: req.user.id } // Don't notify the author
    });
    
    const recipients = [...courseStudents, ...courseTeachers];
    
    // Create notifications
    const notifications = recipients.map(recipient => ({
      recipient: recipient._id,
      sender: req.user.id,
      type: 'discussion',
      title: 'New Discussion Posted',
      message: `${user.name} started a new discussion: "${title}"`,
      relatedDiscussion: discussion._id
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
};

/**
 * Add a reply to a discussion
 */
exports.addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    // Find discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // For global discussions (no course), allow any authenticated user to reply
    // For course-specific discussions, verify user is enrolled in or teaching the course
    if (discussion.course) {
      // This is a course-specific discussion
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is enrolled in or teaching this course
      const isEnrolled = user.enrolledCourses && user.enrolledCourses.includes(discussion.course);
      const isTeaching = user.taughtCourses && user.taughtCourses.includes(discussion.course);
      
      if (!isEnrolled && !isTeaching) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to reply to this discussion'
        });
      }
    }
    // For global discussions (no course), any authenticated user can reply
    // The protect middleware already ensures the user is authenticated
    
    // Add reply
    discussion.replies.push({
      author: req.user.id,
      content
    });
    
    await discussion.save();
    
    // Populate reply author information
    await discussion.populate('replies.author', 'name email role');
    
    // Create notification for discussion participants (except the replier)
    const participantIds = [
      discussion.author.toString(),
      ...discussion.replies.map(reply => reply.author.toString())
    ];
    
    const uniqueParticipantIds = [...new Set(participantIds)].filter(
      id => id !== req.user.id.toString()
    );
    
    const recipients = await User.find({
      _id: { $in: uniqueParticipantIds }
    });
    
    // Create notifications
    const notifications = recipients.map(recipient => ({
      recipient: recipient._id,
      sender: req.user.id,
      type: 'discussion_reply',
      title: 'New Reply to Discussion',
      message: `${user.name} replied to the discussion: "${discussion.title}"`,
      relatedDiscussion: discussion._id
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      message: 'Reply added successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

/**
 * Like a discussion
 */
exports.likeDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    // Find discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // For global discussions (no course), allow any authenticated user to like
    // For course-specific discussions, verify user is enrolled in or teaching the course
    if (discussion.course) {
      // This is a course-specific discussion
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is enrolled in or teaching this course
      const isEnrolled = user.enrolledCourses && user.enrolledCourses.includes(discussion.course);
      const isTeaching = user.taughtCourses && user.taughtCourses.includes(discussion.course);
      
      if (!isEnrolled && !isTeaching) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to like this discussion'
        });
      }
    }
    // For global discussions (no course), any authenticated user can like
    // The protect middleware already ensures the user is authenticated
    
    // Check if user already liked the discussion
    const alreadyLiked = discussion.likes.includes(req.user.id);
    
    if (alreadyLiked) {
      // Unlike
      discussion.likes = discussion.likes.filter(
        id => id.toString() !== req.user.id.toString()
      );
    } else {
      // Like
      discussion.likes.push(req.user.id);
    }
    
    await discussion.save();
    
    res.json({
      success: true,
      message: alreadyLiked ? 'Discussion unliked' : 'Discussion liked',
      data: {
        liked: !alreadyLiked,
        likeCount: discussion.likes.length
      }
    });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like discussion',
      error: error.message
    });
  }
};

/**
 * Get a single discussion with all replies
 */
exports.getDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    // Find discussion with author and reply authors populated
    const discussion = await Discussion.findById(discussionId)
      .populate('author', 'name email role')
      .populate('replies.author', 'name email role')
      .populate('likes', 'name');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // For global discussions (no course), allow any authenticated user to view
    // For course-specific discussions, verify user is enrolled in or teaching the course
    if (discussion.course) {
      // This is a course-specific discussion
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is enrolled in or teaching this course
      const isEnrolled = user.enrolledCourses && user.enrolledCourses.includes(discussion.course);
      const isTeaching = user.taughtCourses && user.taughtCourses.includes(discussion.course);
      
      if (!isEnrolled && !isTeaching) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this discussion'
        });
      }
    }
    // For global discussions (no course), any authenticated user can view
    // The protect middleware already ensures the user is authenticated
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.json({
      success: true,
      message: 'Discussion retrieved successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
};