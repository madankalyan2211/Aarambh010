const { User, Course } = require('../models');

/**
 * Get all available teachers (PUBLIC - no authentication required)
 */
exports.getPublicTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      isActive: true 
    })
    .select('name email bio avatar teachingCourses students')
    .populate('teachingCourses', 'name description category difficulty tags')
    .lean(); // Use lean for better performance

    // Format teachers with proper course mapping
    const teachersWithCount = teachers.map(teacher => {
      const teachingCourses = (teacher.teachingCourses || []).map(course => ({
        id: course._id.toString(),
        _id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags || [],
      }));

      return {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        bio: teacher.bio || '',
        avatar: teacher.avatar || '',
        role: 'teacher',
        studentCount: teacher.students?.length || 0,
        courseCount: teachingCourses.length,
        teachingCourses: teachingCourses,
      };
    });

    res.status(200).json({
      success: true,
      data: teachersWithCount,
    });
  } catch (error) {
    console.error('Get public teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message,
    });
  }
};

/**
 * Get all available teachers
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      isActive: true 
    })
    .select('name email bio avatar teachingCourses students')
    .populate('teachingCourses', 'name description category difficulty tags')
    .lean(); // Use lean for better performance

    // Format teachers with proper course mapping
    const teachersWithCount = teachers.map(teacher => {
      const teachingCourses = (teacher.teachingCourses || []).map(course => ({
        id: course._id.toString(),
        _id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags || [],
      }));

      return {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        bio: teacher.bio || '',
        avatar: teacher.avatar || '',
        role: 'teacher',
        studentCount: teacher.students?.length || 0,
        courseCount: teachingCourses.length,
        teachingCourses: teachingCourses,
      };
    });

    res.status(200).json({
      success: true,
      data: teachersWithCount,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message,
    });
  }
};

/**
 * Get student's enrolled teachers
 */
exports.getMyTeachers = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId)
      .populate({
        path: 'enrolledTeachers',
        select: 'name email bio avatar teachingCourses students',
        populate: {
          path: 'teachingCourses',
          select: 'name description category difficulty tags'
        }
      })
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const teachers = (student.enrolledTeachers || []).map(teacher => {
      const teachingCourses = (teacher.teachingCourses || []).map(course => ({
        id: course._id.toString(),
        _id: course._id.toString(),
        name: course.name,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        tags: course.tags || [],
      }));

      return {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        bio: teacher.bio || '',
        avatar: teacher.avatar || '',
        role: 'teacher',
        studentCount: teacher.students?.length || 0,
        courseCount: teachingCourses.length,
        teachingCourses: teachingCourses,
      };
    });

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error('Get my teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled teachers',
      error: error.message,
    });
  }
};

/**
 * Enroll with a teacher (student enrolls with teacher)
 */
exports.enrollWithTeacher = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId } = req.body;

    console.log('📚 Enrollment Request:');
    console.log('  Student ID:', studentId);
    console.log('  Request Body:', req.body);
    console.log('  Teacher ID from body:', teacherId);

    if (!teacherId) {
      console.log('❌ Teacher ID is missing!');
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required',
      });
    }

    // Find student and teacher
    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Check if already enrolled
    if (student.enrolledTeachers.includes(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled with this teacher',
      });
    }

    // Add teacher to student's enrolledTeachers
    student.enrolledTeachers.push(teacherId);
    await student.save();

    // Add student to teacher's students
    if (!teacher.students.includes(studentId)) {
      teacher.students.push(studentId);
      await teacher.save();
    }

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled with teacher',
      data: {
        teacher: teacher.toPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Enroll with teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling with teacher',
      error: error.message,
    });
  }
};

/**
 * Unenroll from a teacher
 */
exports.unenrollFromTeacher = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId } = req.body;

    console.log('\n==============================================');
    console.log('👨‍🏫 TEACHER UNENROLLMENT');
    console.log('  Student ID:', studentId);
    console.log('  Teacher ID:', teacherId);
    console.log('==============================================\n');

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required',
      });
    }

    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);

    if (!student || !teacher) {
      return res.status(404).json({
        success: false,
        message: 'Student or teacher not found',
      });
    }

    // Find all courses taught by this teacher that the student is enrolled in
    const teacherCourses = await Course.find({
      teacher: teacherId,
      enrolledStudents: studentId,
      isActive: true,
    });

    console.log(`  Found ${teacherCourses.length} courses to unenroll from`);

    // Unenroll student from all teacher's courses
    for (const course of teacherCourses) {
      console.log(`  ✅ Unenrolling from course: ${course.name}`);
      course.enrolledStudents = course.enrolledStudents.filter(
        id => id.toString() !== studentId
      );
      await course.save();
    }

    // Remove teacher from student's enrolledTeachers
    student.enrolledTeachers = student.enrolledTeachers.filter(
      id => id.toString() !== teacherId
    );
    await student.save();
    console.log('  ✅ Teacher removed from student.enrolledTeachers');

    // Remove student from teacher's students
    teacher.students = teacher.students.filter(
      id => id.toString() !== studentId
    );
    await teacher.save();
    console.log('  ✅ Student removed from teacher.students');

    console.log('\n✅ TEACHER UNENROLLMENT SUCCESSFUL');
    console.log(`  Unenrolled from ${teacherCourses.length} courses`);
    console.log('==============================================\n');

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from teacher and all their courses',
      data: {
        unenrolledCourses: teacherCourses.length,
      },
    });
  } catch (error) {
    console.error('❌ Unenroll from teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unenrolling from teacher',
      error: error.message,
    });
  }
};

/**
 * Get teacher's students
 */
exports.getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId)
      .populate('students', 'name email avatar bio enrolledCourses learningStreak totalXP');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    const students = teacher.students.map(student => ({
      ...student.toPublicProfile(),
      courseCount: student.enrolledCourses?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

/**
 * Enroll in a course with teacher selection
 * This also enrolls the student with the selected teacher
 */
exports.enrollInCourseWithTeacher = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, teacherId } = req.body;

    console.log('\n==============================================');
    console.log('🎓 ENROLLMENT REQUEST');
    console.log('  Student ID:', studentId);
    console.log('  Course ID:', courseId);
    console.log('  Teacher ID:', teacherId);
    console.log('==============================================\n');

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required',
      });
    }

    // Find student, course, and teacher
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);
    const teacher = await User.findById(teacherId);

    if (!student || student.role !== 'student') {
      console.log('❌ Student not found or invalid role');
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (!teacher || teacher.role !== 'teacher') {
      console.log('❌ Teacher not found or invalid role');
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Verify teacher is teaching this course
    const isTeachingCourse = teacher.teachingCourses.some(
      tc => tc.toString() === courseId
    );

    if (!isTeachingCourse) {
      console.log('❌ Teacher is not teaching this course');
      return res.status(400).json({
        success: false,
        message: 'Selected teacher is not teaching this course',
      });
    }

    // Check if course is full
    if (course.enrolledStudents.length >= course.maxStudents) {
      console.log('❌ Course is full');
      return res.status(400).json({
        success: false,
        message: 'Course is full',
      });
    }

    // Enroll student in course if not already enrolled
    const wasAlreadyEnrolled = course.enrolledStudents.some(id => id.toString() === studentId);
    
    if (!wasAlreadyEnrolled) {
      console.log('✅ Adding student to course.enrolledStudents');
      course.enrolledStudents.push(studentId);
      await course.save();
      console.log('✅ Student added to course successfully');
    } else {
      console.log('⚠️ Student already enrolled in course');
    }

    // Enroll with teacher if not already enrolled
    if (!student.enrolledTeachers.includes(teacherId)) {
      console.log('✅ Enrolling student with teacher');
      student.enrolledTeachers.push(teacherId);
      await student.save();

      // Add student to teacher's students list
      if (!teacher.students.includes(studentId)) {
        teacher.students.push(studentId);
        await teacher.save();
      }
    }

    console.log('\n✅ ENROLLMENT SUCCESSFUL');
    console.log('  Course:', course.name);
    console.log('  Teacher:', teacher.name);
    console.log('  Total enrolled students in course:', course.enrolledStudents.length);
    console.log('  Student is in enrolledStudents:', course.enrolledStudents.some(id => id.toString() === studentId));
    console.log('==============================================\n');

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course and with teacher',
      data: {
        courseId: course._id.toString(),
        courseName: course.name,
        teacherId: teacher._id.toString(),
        teacherName: teacher.name,
      },
    });
  } catch (error) {
    console.error('❌ Enroll in course with teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message,
    });
  }
};

/**
 * Unenroll from a course
 * This removes the student from the course and also unenrolls from teacher if no other courses
 */
exports.unenrollFromCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    console.log('\n==============================================');
    console.log('📚 COURSE UNENROLLMENT');
    console.log('  Student ID:', studentId);
    console.log('  Course ID:', courseId);
    console.log('==============================================\n');

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const course = await Course.findById(courseId).populate('teacher');
    const student = await User.findById(studentId);

    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (!student) {
      console.log('❌ Student not found');
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const teacherId = course.teacher?._id || course.teacher;

    // Remove student from course
    console.log('✅ Removing student from course.enrolledStudents');
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await course.save();
    console.log('✅ Student removed from course');

    // Check if student is enrolled in any other courses from this teacher
    if (teacherId) {
      console.log('\n🔍 Checking other courses from this teacher...');
      
      const otherCoursesFromTeacher = await Course.find({
        teacher: teacherId,
        enrolledStudents: studentId,
        _id: { $ne: courseId }, // Exclude current course
        isActive: true,
      });

      console.log(`  Found ${otherCoursesFromTeacher.length} other courses from this teacher`);

      // If no other courses from this teacher, unenroll from teacher
      if (otherCoursesFromTeacher.length === 0) {
        console.log('\n✅ No other courses from teacher - Unenrolling from teacher');
        
        // Remove teacher from student's enrolledTeachers
        student.enrolledTeachers = student.enrolledTeachers.filter(
          id => id.toString() !== teacherId.toString()
        );
        await student.save();
        console.log('✅ Teacher removed from student.enrolledTeachers');

        // Remove student from teacher's students list
        const teacher = await User.findById(teacherId);
        if (teacher) {
          teacher.students = teacher.students.filter(
            id => id.toString() !== studentId
          );
          await teacher.save();
          console.log('✅ Student removed from teacher.students');
        }
      } else {
        console.log('\n⚠️ Student still enrolled in other courses from this teacher - Keeping teacher enrollment');
      }
    }

    console.log('\n✅ UNENROLLMENT SUCCESSFUL');
    console.log('==============================================\n');

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    console.error('❌ Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unenrolling from course',
      error: error.message,
    });
  }
};
