const { Assignment, Submission, User, Course } = require('../models');
const upload = require('../middleware/upload');
const { processAndGradePDFSubmission, gradeAssignmentWithAI } = require('../services/ai.service');

/**
 * Create a new assignment (Teacher only)
 */
exports.createAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const {
      title,
      description,
      courseId,
      dueDate,
      totalPoints,
      passingScore,
      instructions,
      attachments,
      allowLateSubmission,
      lateSubmissionPenalty,
      enableAIDetection,
      enablePlagiarismCheck,
    } = req.body;

    console.log('\n==============================================');
    console.log('📝 CREATE ASSIGNMENT REQUEST');
    console.log('  Teacher ID:', teacherId);
    console.log('  Course ID:', courseId);
    console.log('  Title:', title);
    console.log('==============================================\n');

    // Validate required fields
    if (!title || !description || !courseId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Verify teacher is teaching this course
    const teacher = await User.findById(teacherId);
    const course = await Course.findById(courseId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create assignments',
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const isTeachingCourse = teacher.teachingCourses.some(
      tc => tc.toString() === courseId
    );

    if (!isTeachingCourse) {
      return res.status(403).json({
        success: false,
        message: 'You are not teaching this course',
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      teacher: teacherId,
      dueDate: new Date(dueDate),
      totalPoints: totalPoints || 100,
      passingScore: passingScore || 60,
      instructions: instructions || '',
      attachments: attachments || [],
      allowLateSubmission: allowLateSubmission !== undefined ? allowLateSubmission : false,
      lateSubmissionPenalty: lateSubmissionPenalty || 10,
      enableAIDetection: enableAIDetection !== undefined ? enableAIDetection : true,
      enablePlagiarismCheck: enablePlagiarismCheck !== undefined ? enablePlagiarismCheck : true,
      isPublished: true,
    });

    console.log('✅ Assignment created:', assignment._id);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('❌ Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message,
    });
  }
};

/**
 * Get assignments for a student (from enrolled teachers only)
 */
exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    console.log('\n==============================================');
    console.log('📚 GET STUDENT ASSIGNMENTS');
    console.log('  Student ID:', studentId);
    console.log('==============================================\n');

    // Get student with enrolled teachers
    const student = await User.findById(studentId).select('enrolledTeachers');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const enrolledTeacherIds = student.enrolledTeachers.map(id => id.toString());
    console.log(`  Enrolled with ${enrolledTeacherIds.length} teachers`);

    // Find courses where student is enrolled
    const enrolledCourses = await Course.find({
      enrolledStudents: studentId,
      isActive: true,
    }).select('_id');

    const enrolledCourseIds = enrolledCourses.map(c => c._id);
    console.log(`  Enrolled in ${enrolledCourseIds.length} courses`);

    // Get assignments from enrolled teachers for enrolled courses
    const assignments = await Assignment.find({
      teacher: { $in: enrolledTeacherIds },
      course: { $in: enrolledCourseIds },
      isPublished: true,
    })
      .populate('course', 'name category')
      .populate('teacher', 'name email')
      .sort({ dueDate: 1 });

    // Get student's submissions for these assignments
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: studentId,
    }).select('assignment status score submittedAt isLate');

    // Create a map of submissions by assignment ID
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignment.toString()] = sub;
    });

    // Combine assignments with submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissionMap[assignment._id.toString()];
      const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const isOverdue = new Date() > new Date(assignment.dueDate);

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        course: {
          id: assignment.course._id.toString(),
          name: assignment.course.name,
          category: assignment.course.category,
        },
        teacher: {
          id: assignment.teacher._id.toString(),
          name: assignment.teacher.name,
          email: assignment.teacher.email,
        },
        dueDate: assignment.dueDate,
        daysLeft,
        isUrgent: daysLeft <= 1 && daysLeft >= 0,
        isOverdue,
        totalPoints: assignment.totalPoints,
        passingScore: assignment.passingScore,
        instructions: assignment.instructions,
        attachments: assignment.attachments,
        // Submission info
        submission: submission ? {
          id: submission._id.toString(),
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt,
          isLate: submission.isLate,
        } : null,
        hasSubmitted: !!submission,
      };
    });

    console.log(`  Found ${assignmentsWithStatus.length} assignments`);

    res.status(200).json({
      success: true,
      data: assignmentsWithStatus,
    });
  } catch (error) {
    console.error('❌ Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message,
    });
  }
};

/**
 * Get assignments created by teacher
 */
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;

    console.log('\n==============================================');
    console.log('📝 GET TEACHER ASSIGNMENTS');
    console.log('  Teacher ID:', teacherId);
    console.log('==============================================\n');

    const assignments = await Assignment.find({
      teacher: teacherId,
    })
      .populate('course', 'name category enrolledStudents')
      .sort({ createdAt: -1 });

    // Get submission counts for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await Submission.find({
          assignment: assignment._id,
        }).select('status score');

        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
        const pendingSubmissions = totalSubmissions - gradedSubmissions;

        return {
          id: assignment._id.toString(),
          title: assignment.title,
          description: assignment.description,
          course: {
            id: assignment.course._id.toString(),
            name: assignment.course.name,
            category: assignment.course.category,
            enrolledStudents: assignment.course.enrolledStudents.length,
          },
          dueDate: assignment.dueDate,
          totalPoints: assignment.totalPoints,
          passingScore: assignment.passingScore,
          isPublished: assignment.isPublished,
          createdAt: assignment.createdAt,
          // Statistics
          totalSubmissions,
          gradedSubmissions,
          pendingSubmissions,
          submissionRate: assignment.course.enrolledStudents.length > 0
            ? Math.round((totalSubmissions / assignment.course.enrolledStudents.length) * 100)
            : 0,
        };
      })
    );

    console.log(`  Found ${assignmentsWithStats.length} assignments`);

    res.status(200).json({
      success: true,
      data: assignmentsWithStats,
    });
  } catch (error) {
    console.error('❌ Get teacher assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message,
    });
  }
};

/**
 * Submit an assignment (Student only)
 */
exports.submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId, content } = req.body;

    // Check if either content or files are provided
    const hasContent = content && content.trim().length > 0;
    const hasFiles = req.files && req.files.length > 0;
    
    if (!assignmentId || (!hasContent && !hasFiles)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and either content or file attachment are required',
      });
    }

    const assignment = await Assignment.findById(assignmentId).populate('course');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if student is enrolled in the course
    const isEnrolled = assignment.course.enrolledStudents.some(
      id => id.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    // Process file attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype,
        size: file.size
      }));
    }

    // Check if late
    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'This assignment is overdue and late submissions are not allowed',
      });
    }

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      course: assignment.course._id,
      content: content || '',
      attachments: attachments,
      isLate,
      submittedAt: now,
      status: 'submitted',
    });

    // Update assignment statistics
    assignment.totalSubmissions += 1;
    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    console.error('❌ Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message,
    });
  }
};

/**
 * Get submissions for a specific assignment (Teacher only)
 */
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these submissions',
      });
    }

    const submissions = await Submission.find({
      assignment: assignmentId,
    })
      .populate('student', 'name email avatar')
      .sort({ submittedAt: -1 });

    // Format submissions to match frontend expectations
    const formattedSubmissions = submissions.map(submission => ({
      id: submission._id.toString(),
      student: {
        id: submission.student._id.toString(),
        name: submission.student.name,
        email: submission.student.email,
      },
      content: submission.content,
      attachments: submission.attachments,
      submittedAt: submission.submittedAt,
      score: submission.score,
      feedback: submission.feedback,
      status: submission.status,
      isLate: submission.isLate,
    }));

    res.status(200).json({
      success: true,
      data: formattedSubmissions,
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message,
    });
  }
};

/**
 * Grade a submission (Teacher only)
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('assignment');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Verify teacher owns this assignment
    if (submission.assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grade this submission',
      });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = teacherId;

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message,
    });
  }
};

/**
 * Grade a submission with AI assistance (Teacher only)
 */
exports.aiGradeSubmission = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;
    const { aiPrompt } = req.body;

    // Log the incoming parameters for debugging
    console.log('🔍 AI Grade Submission Request:');
    console.log('  Teacher ID:', teacherId);
    console.log('  Submission ID from params:', submissionId);
    console.log('  Submission ID type:', typeof submissionId);
    console.log('  AI Prompt:', aiPrompt);

    // Check if submissionId is valid
    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID is required',
      });
    }

    const submission = await Submission.findById(submissionId).populate('assignment student');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Verify teacher owns this assignment
    if (submission.assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grade this submission',
      });
    }

    // Check if submission has PDF attachments
    const hasPDFAttachments = submission.attachments && submission.attachments.some(att => 
      att.type === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf')
    );

    let aiResult;
    
    if (hasPDFAttachments) {
      // Process and grade PDF submission
      console.log('📄 Processing PDF submission with AI');
      aiResult = await processAndGradePDFSubmission(submission, submission.assignment);
    } else {
      // Grade text-based submission
      console.log('📝 Processing text submission with AI');
      const contentForAnalysis = submission.content || '[No content provided]';
      aiResult = await gradeAssignmentWithAI(contentForAnalysis, submission.assignment);
    }

    res.status(200).json({
      success: true,
      message: 'AI grading completed successfully',
      data: {
        score: aiResult.score,
        feedback: aiResult.feedback,
        suggestions: aiResult.suggestions || [
          "Consider adding more detailed explanations for complex concepts",
          "Include examples to demonstrate your understanding",
          "Review formatting for better readability"
        ],
        pdfProcessed: aiResult.pdfProcessed || false,
        pdfName: aiResult.pdfName || null
      },
    });
  } catch (error) {
    console.error('AI grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error with AI grading',
      error: error.message,
    });
  }
};

/**
 * Helper function to generate AI feedback
 */
function generateAIFeedback(content, assignment, hasPDFAttachments) {
  // This is a simulation - in a real implementation, this would call an AI service like OpenAI
  const feedbackTemplates = [
    `Great work on this assignment! Your response shows a solid understanding of ${assignment.title}.`,
    `Your submission demonstrates good comprehension of the key concepts.`,
    `Well done! You've addressed all the main points effectively.`,
    `Excellent analysis! Your approach to the problem shows creativity and insight.`
  ];
  
  const pdfFeedbackTemplates = [
    `I can see you've included PDF attachments which adds valuable supporting material to your work.`,
    `Your submission with PDF attachments shows thorough research and documentation efforts.`,
    `The inclusion of PDF files significantly enhances the quality and depth of your submission.`,
    `Great job incorporating external resources through your PDF attachments.`
  ];
  
  const improvementTemplates = [
    "To improve, consider adding more specific examples.",
    "Try to elaborate on your reasoning in the middle section.",
    "Consider revising the conclusion for more impact.",
    "Adding diagrams or charts would enhance your presentation."
  ];
  
  const pdfImprovementTemplates = [
    "Consider adding more detailed explanations to complement your PDF attachments.",
    "Try to reference specific sections from your PDF files in your written analysis.",
    "Consider summarizing the key points from your PDF attachments in your main response.",
    "You could expand on how the content in your PDF files supports your arguments."
  ];
  
  let randomFeedback;
  if (hasPDFAttachments) {
    // Mix regular feedback with PDF-specific feedback
    const allFeedbackTemplates = [...feedbackTemplates, ...pdfFeedbackTemplates];
    randomFeedback = allFeedbackTemplates[Math.floor(Math.random() * allFeedbackTemplates.length)];
  } else {
    randomFeedback = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
  }
  
  // Choose improvement suggestions
  let randomImprovement;
  if (hasPDFAttachments) {
    // Mix regular improvements with PDF-specific improvements
    const allImprovementTemplates = [...improvementTemplates, ...pdfImprovementTemplates];
    randomImprovement = allImprovementTemplates[Math.floor(Math.random() * allImprovementTemplates.length)];
  } else {
    randomImprovement = improvementTemplates[Math.floor(Math.random() * improvementTemplates.length)];
  }
  
  return `${randomFeedback} ${randomImprovement}`;
}
