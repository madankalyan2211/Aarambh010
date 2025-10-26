const { Course, User } = require('../models');

/**
 * Get all available courses (PUBLIC - no authentication required)
 */
exports.getPublicCourses = async (req, res) => {
  try {
    console.log('\n==============================================');
    console.log('📚 getPublicCourses API Called (PUBLIC)');
    console.log('==============================================\n');
    
    const courses = await Course.find({ isActive: true, isPublished: true })
      .select('name description category difficulty tags maxStudents enrolledStudents image teacher')
      .populate('teacher', 'name email')
      .sort({ category: 1, difficulty: 1 });

    // Helper function to get category-specific image
    const getCategoryImage = (category) => {
      const categoryImages = {
        'Programming': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        'Database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
        'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
        'AI & Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      };
      
      return categoryImages[category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
    };

    const coursesWithCount = courses.map(course => {
      return {
        id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags,
        maxStudents: course.maxStudents,
        enrolledCount: course.enrolledStudents?.length || 0,
        image: course.image || getCategoryImage(course.category),
        teacher: course.teacher ? {
          id: course.teacher._id.toString(),
          name: course.teacher.name,
          email: course.teacher.email
        } : null
      };
    });

    console.log(`\n📊 Total courses: ${coursesWithCount.length}\n`);

    res.status(200).json({
      success: true,
      data: coursesWithCount,
    });
  } catch (error) {
    console.error('❌ Get public courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

/**
 * Get all available courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const userId = req.user?.id; // Get authenticated user ID if available
    
    console.log('\n==============================================');
    console.log('📚 getAllCourses API Called');
    console.log('  User ID:', userId);
    console.log('  User Role:', req.user?.role);
    console.log('==============================================\n');
    
    const courses = await Course.find({ isActive: true, isPublished: true })
      .select('name description category difficulty tags maxStudents enrolledStudents image teacher')
      .populate('teacher', 'name email')
      .sort({ category: 1, difficulty: 1 });

    // Helper function to get category-specific image
    const getCategoryImage = (category) => {
      const categoryImages = {
        'Programming': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        'Database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
        'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
        'AI & Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      };
      
      return categoryImages[category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
    };

    const coursesWithCount = courses.map(course => {
      const isEnrolled = userId ? course.enrolledStudents?.some(id => id.toString() === userId) : false;
      
      if (isEnrolled) {
        console.log(`  ✅ Course: ${course.name} - ENROLLED`);
      }
      
      return {
        id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags,
        maxStudents: course.maxStudents,
        enrolledCount: course.enrolledStudents?.length || 0,
        image: course.image || getCategoryImage(course.category),
        // Include enrollment status for authenticated students
        isEnrolled: isEnrolled,
        enrolledStudents: course.enrolledStudents || [], // Include for frontend check
        teacher: course.teacher ? {
          id: course.teacher._id.toString(),
          name: course.teacher.name,
          email: course.teacher.email
        } : null
      };
    });

    console.log(`\n📊 Total courses: ${coursesWithCount.length}`);
    console.log(`🎯 Enrolled courses: ${coursesWithCount.filter(c => c.isEnrolled).length}\n`);

    res.status(200).json({
      success: true,
      data: coursesWithCount,
    });
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

/**
 * Get teacher's teaching courses
 */
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId)
      .populate('teachingCourses', 'name description category difficulty tags maxStudents enrolledStudents');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    const coursesWithCount = teacher.teachingCourses.map(course => ({
      id: course._id.toString(),
      name: course.name,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      tags: course.tags,
      maxStudents: course.maxStudents,
      enrolledCount: course.enrolledStudents?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: coursesWithCount,
    });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher courses',
      error: error.message,
    });
  }
};

/**
 * Add course to teacher's teaching list
 */
exports.addTeachingCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.body;

    console.log('📚 Add Teaching Course Request:');
    console.log('  Teacher ID:', teacherId);
    console.log('  Course ID:', courseId);

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const teacher = await User.findById(teacherId);
    const course = await Course.findById(courseId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already teaching this course
    if (teacher.teachingCourses.some(id => id.toString() === courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Already teaching this course',
      });
    }

    // Add course to teacher's teaching list
    teacher.teachingCourses.push(courseId);
    await teacher.save();

    // Update course teacher field to reference this teacher
    course.teacher = teacherId;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course added to teaching list',
      data: {
        courseId: course._id.toString(),
        courseName: course.name,
      },
    });
  } catch (error) {
    console.error('Add teaching course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course',
      error: error.message,
    });
  }
};

/**
 * Remove course from teacher's teaching list
 */
exports.removeTeachingCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const teacher = await User.findById(teacherId);
    const course = await Course.findById(courseId);

    if (!teacher || !course) {
      return res.status(404).json({
        success: false,
        message: 'Teacher or course not found',
      });
    }

    // Remove course from teacher's teaching list
    teacher.teachingCourses = teacher.teachingCourses.filter(
      id => id.toString() !== courseId
    );
    await teacher.save();

    // Update course teacher field - set to null since this teacher is no longer teaching it
    course.teacher = null;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course removed from teaching list',
    });
  } catch (error) {
    console.error('Remove teaching course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course',
      error: error.message,
    });
  }
};

/**
 * Get course content with modules and lessons
 */
exports.getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('📚 Getting course content for courseId:', courseId);

    const course = await Course.findById(courseId)
      .select('name description category difficulty tags enrolledStudents maxStudents modules')
      .populate('teacher', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Format response
    const courseData = {
      id: course._id.toString(),
      name: course.name,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      tags: course.tags || [],
      enrolledCount: course.enrolledStudents?.length || 0,
      maxStudents: course.maxStudents || 100,
      instructor: course.teacher ? {
        name: course.teacher.name,
        email: course.teacher.email,
      } : null,
      modules: course.modules || [],
    };

    res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course content',
      error: error.message,
    });
  }
};

/**
 * Get student's enrolled courses
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Find ONLY courses where student is explicitly enrolled in enrolledStudents array
    const enrolledCourses = await Course.find({
      enrolledStudents: studentId,
      isActive: true,
    })
      .populate('teacher', 'name email')
      .select('name description category difficulty tags maxStudents enrolledStudents modules image')
      .sort({ createdAt: -1 });

    // Helper function to get category-specific image
    const getCategoryImage = (category, courseName) => {
      const categoryImages = {
        'Programming': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        'Database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
        'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
        'AI & Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      };
      
      return categoryImages[category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
    };

    const coursesWithProgress = enrolledCourses.map(course => {
      // Calculate progress based on completed lessons (if tracked)
      const totalLessons = course.modules?.reduce((sum, module) => 
        sum + (module.lessons?.length || 0), 0) || 0;
      
      return {
        id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags,
        image: course.image || getCategoryImage(course.category, course.name),
        progress: 0, // TODO: Implement lesson completion tracking
        totalLessons: totalLessons,
        nextLesson: course.modules?.[0]?.lessons?.[0]?.title || 'Start Learning',
        instructor: course.teacher ? {
          name: course.teacher.name,
          email: course.teacher.email,
        } : null,
      };
    });

    console.log(`📚 Found ${coursesWithProgress.length} explicitly enrolled courses for student`);

    res.status(200).json({
      success: true,
      data: coursesWithProgress,
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error.message,
    });
  }
};

/**
 * Enroll in a course
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    if (course.enrolledStudents.some(id => id.toString() === studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Check if course is full
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full',
      });
    }

    // Enroll student
    course.enrolledStudents.push(studentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseId: course._id.toString(),
        courseName: course.name,
      },
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message,
    });
  }
};

/**
 * Unenroll from a course
 */
exports.unenrollFromCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Remove student from enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unenrolling from course',
      error: error.message,
    });
  }
};

/**
 * Update course content (teacher only)
 */
exports.updateCourseContent = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { name, description, category, difficulty, tags, maxStudents, isPublished } = req.body;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Update course fields
    if (name) course.name = name;
    if (description) course.description = description;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;
    if (tags) course.tags = tags;
    if (maxStudents !== undefined) course.maxStudents = maxStudents;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message,
    });
  }
};

/**
 * Add module to course (teacher only)
 */
exports.addModule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Create new module
    const newModule = {
      title: title || 'New Module',
      description: description || '',
      order: order || (course.modules?.length || 0) + 1,
    };

    course.modules = course.modules || [];
    course.modules.push(newModule);
    
    // Sort modules by order
    course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: newModule,
    });
  } catch (error) {
    console.error('Add module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message,
    });
  }
};

/**
 * Update module (teacher only)
 */
exports.updateModule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId } = req.params;
    const { title, description, order } = req.body;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Update module fields
    if (title !== undefined) course.modules[moduleIndex].title = title;
    if (description !== undefined) course.modules[moduleIndex].description = description;
    if (order !== undefined) course.modules[moduleIndex].order = order;

    // Sort modules by order
    course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: course.modules[moduleIndex],
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating module',
      error: error.message,
    });
  }
};

/**
 * Delete module (teacher only)
 */
exports.deleteModule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId } = req.params;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Remove module
    course.modules.splice(moduleIndex, 1);

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully',
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting module',
      error: error.message,
    });
  }
};

/**
 * Add lesson to module (teacher only)
 */
exports.addLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId } = req.params;
    const { title, videoUrl, duration, order, type } = req.body;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Create new lesson
    const newLesson = {
      title: title || 'New Lesson',
      videoUrl: videoUrl || '',
      duration: duration || 0,
      order: order || (course.modules[moduleIndex].lessons?.length || 0) + 1,
      type: type || 'video',
    };

    course.modules[moduleIndex].lessons = course.modules[moduleIndex].lessons || [];
    course.modules[moduleIndex].lessons.push(newLesson);
    
    // Sort lessons by order
    course.modules[moduleIndex].lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    await course.save();

    // Find the created lesson to get its ID
    const createdLesson = course.modules[moduleIndex].lessons[course.modules[moduleIndex].lessons.length - 1];

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: {
        ...newLesson,
        _id: createdLesson._id
      },
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding lesson',
      error: error.message,
    });
  }
};

/**
 * Update lesson (teacher only)
 */
exports.updateLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId, lessonId } = req.params;
    const { title, videoUrl, duration, order, type } = req.body;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Find lesson
    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l, index) => l._id?.toString() === lessonId || index.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Update lesson fields
    if (title !== undefined) course.modules[moduleIndex].lessons[lessonIndex].title = title;
    if (videoUrl !== undefined) course.modules[moduleIndex].lessons[lessonIndex].videoUrl = videoUrl;
    if (duration !== undefined) course.modules[moduleIndex].lessons[lessonIndex].duration = duration;
    if (order !== undefined) course.modules[moduleIndex].lessons[lessonIndex].order = order;
    if (type !== undefined) course.modules[moduleIndex].lessons[lessonIndex].type = type;

    // Sort lessons by order
    course.modules[moduleIndex].lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: course.modules[moduleIndex].lessons[lessonIndex],
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lesson',
      error: error.message,
    });
  }
};

/**
 * Delete lesson (teacher only)
 */
exports.deleteLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId, lessonId } = req.params;

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Find lesson
    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l, index) => l._id?.toString() === lessonId || index.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Remove lesson
    course.modules[moduleIndex].lessons.splice(lessonIndex, 1);

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lesson',
      error: error.message,
    });
  }
};

/**
 * Generate AI summary for a lesson
 */
exports.generateLessonSummary = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    
    console.log('🤖 Generate AI Summary Request:');
    console.log('  Course ID:', courseId);
    console.log('  Module ID:', moduleId);
    console.log('  Lesson ID:', lessonId);

    // Find course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Find module
    const module = course.modules.id(moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Find lesson
    const lesson = module.lessons.id(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Import AI service
    const { generateVideoSummary } = require('../services/ai.service');
    
    // Generate summary using lesson title and video URL
    const summary = await generateVideoSummary(lesson.title, lesson.videoUrl || '');
    
    res.status(200).json({
      success: true,
      message: 'AI summary generated successfully',
      data: {
        summary: summary,
      },
    });
  } catch (error) {
    console.error('Generate AI summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI summary',
      error: error.message,
    });
  }
};

/**
 * Upload lesson video (teacher only)
 */
exports.uploadLessonVideo = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId, lessonId } = req.params;
    const videoFile = req.file;

    // Check if file was uploaded
    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded',
      });
    }

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Find lesson
    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l, index) => l._id?.toString() === lessonId || index.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Construct video URL - in a real app, this would be a cloud storage URL
    // For now, we'll use the local file path
    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${videoFile.filename}`;

    // Update lesson with video URL
    course.modules[moduleIndex].lessons[lessonIndex].videoUrl = videoUrl;
    course.modules[moduleIndex].lessons[lessonIndex].type = 'video';

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoUrl: videoUrl,
      },
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message,
    });
  }
};

/**
 * Upload lesson PDF (teacher only)
 */
exports.uploadLessonPDF = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, moduleId, lessonId } = req.params;
    const pdfFile = req.file;

    // Check if file was uploaded
    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
      });
    }

    // Find course and check if teacher is authorized
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if teacher is authorized to edit this course
    if (course.teacher?.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this course',
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      (m, index) => m._id?.toString() === moduleId || index.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Find lesson
    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l, index) => l._id?.toString() === lessonId || index.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Construct PDF URL - in a real app, this would be a cloud storage URL
    // For now, we'll use the local file path
    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfFile.filename}`;

    // Update lesson with PDF URL
    course.modules[moduleIndex].lessons[lessonIndex].pdfUrl = pdfUrl;
    course.modules[moduleIndex].lessons[lessonIndex].type = 'pdf';

    await course.save();

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        pdfUrl: pdfUrl,
      },
    });
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading PDF',
      error: error.message,
    });
  }
};

// Make sure this is at the end of the file
module.exports = exports;
