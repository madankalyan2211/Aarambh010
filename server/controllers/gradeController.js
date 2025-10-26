const { Submission, Assignment, Course, User, Grade } = require('../models');

/**
 * Get student's grades (from graded submissions)
 */
exports.getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user.id;

    console.log('\n==============================================');
    console.log('📊 GET STUDENT GRADES');
    console.log('  Student ID:', studentId);
    console.log('==============================================\n');

    // Find all graded submissions for this student
    const submissions = await Submission.find({
      student: studentId,
      status: 'graded',
    })
      .populate('assignment', 'title totalPoints course')
      .populate('course', 'name category')
      .sort({ gradedAt: -1 });

    console.log(`  Found ${submissions.length} graded submissions`);

    // Transform submissions to grade format
    const grades = submissions.map(submission => {
      const assignment = submission.assignment;
      const course = submission.course;
      
      // Calculate percentage score
      const percentage = assignment.totalPoints > 0 
        ? Math.round((submission.score / assignment.totalPoints) * 100)
        : 0;
      
      // Determine letter grade
      let letterGrade = 'F';
      if (percentage >= 97) letterGrade = 'A+';
      else if (percentage >= 93) letterGrade = 'A';
      else if (percentage >= 90) letterGrade = 'A-';
      else if (percentage >= 87) letterGrade = 'B+';
      else if (percentage >= 83) letterGrade = 'B';
      else if (percentage >= 80) letterGrade = 'B-';
      else if (percentage >= 77) letterGrade = 'C+';
      else if (percentage >= 73) letterGrade = 'C';
      else if (percentage >= 70) letterGrade = 'C-';
      else if (percentage >= 60) letterGrade = 'D';
      
      return {
        id: submission._id.toString(),
        assignment: assignment.title,
        course: {
          id: course._id.toString(),
          name: course.name,
          category: course.category,
        },
        score: submission.score,
        maxScore: assignment.totalPoints,
        percentage: percentage,
        weight: 10, // Default weight, could be configurable
        letterGrade: letterGrade,
        feedback: submission.feedback || '',
        gradedAt: submission.gradedAt,
        assignmentId: assignment._id.toString(),
      };
    });

    // Calculate overall statistics
    const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
    const maxPoints = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
    const overallPercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    
    // Determine overall letter grade
    let overallLetterGrade = 'F';
    if (overallPercentage >= 97) overallLetterGrade = 'A+';
    else if (overallPercentage >= 93) overallLetterGrade = 'A';
    else if (overallPercentage >= 90) overallLetterGrade = 'A-';
    else if (overallPercentage >= 87) overallLetterGrade = 'B+';
    else if (overallPercentage >= 83) overallLetterGrade = 'B';
    else if (overallPercentage >= 80) overallLetterGrade = 'B-';
    else if (overallPercentage >= 77) overallLetterGrade = 'C+';
    else if (overallPercentage >= 73) overallLetterGrade = 'C';
    else if (overallPercentage >= 70) overallLetterGrade = 'C-';
    else if (overallPercentage >= 60) overallLetterGrade = 'D';

    const responseData = {
      grades: grades,
      statistics: {
        totalAssignments: grades.length,
        totalPoints: totalPoints,
        maxPoints: maxPoints,
        overallPercentage: overallPercentage,
        overallLetterGrade: overallLetterGrade,
        // Grade distribution
        gradeDistribution: {
          'A+': grades.filter(g => g.letterGrade === 'A+').length,
          'A': grades.filter(g => g.letterGrade === 'A').length,
          'A-': grades.filter(g => g.letterGrade === 'A-').length,
          'B+': grades.filter(g => g.letterGrade === 'B+').length,
          'B': grades.filter(g => g.letterGrade === 'B').length,
          'B-': grades.filter(g => g.letterGrade === 'B-').length,
          'C+': grades.filter(g => g.letterGrade === 'C+').length,
          'C': grades.filter(g => g.letterGrade === 'C').length,
          'C-': grades.filter(g => g.letterGrade === 'C-').length,
          'D': grades.filter(g => g.letterGrade === 'D').length,
          'F': grades.filter(g => g.letterGrade === 'F').length,
        }
      }
    };

    console.log(`  Overall grade: ${overallPercentage}% (${overallLetterGrade})`);

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('❌ Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message,
    });
  }
};

/**
 * Get teacher's grades overview (for their courses)
 */
exports.getTeacherGrades = async (req, res) => {
  try {
    const teacherId = req.user.id;

    console.log('\n==============================================');
    console.log('📊 GET TEACHER GRADES');
    console.log('  Teacher ID:', teacherId);
    console.log('==============================================\n');

    // Find all assignments created by this teacher
    const assignments = await Assignment.find({
      teacher: teacherId,
    }).select('_id title course');

    const assignmentIds = assignments.map(a => a._id);

    // Find all submissions for these assignments
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
    })
      .populate('student', 'name email')
      .populate('assignment', 'title')
      .populate('course', 'name')
      .sort({ submittedAt: -1 });

    // Group submissions by assignment
    const assignmentGrades = assignments.map(assignment => {
      const assignmentSubmissions = submissions.filter(
        s => s.assignment._id.toString() === assignment._id.toString()
      );
      
      const gradedSubmissions = assignmentSubmissions.filter(s => s.status === 'graded');
      const pendingSubmissions = assignmentSubmissions.filter(s => s.status !== 'graded');
      
      // Calculate average score for graded submissions
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = gradedSubmissions.length > 0 
        ? Math.round(totalScore / gradedSubmissions.length)
        : 0;

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        course: assignment.course ? {
          id: assignment.course._id.toString(),
          name: assignment.course.name,
        } : null,
        totalSubmissions: assignmentSubmissions.length,
        gradedSubmissions: gradedSubmissions.length,
        pendingSubmissions: pendingSubmissions.length,
        averageScore: averageScore,
        submissions: gradedSubmissions.map(s => ({
          id: s._id.toString(),
          student: {
            id: s.student._id.toString(),
            name: s.student.name,
            email: s.student.email,
          },
          score: s.score,
          status: s.status,
          submittedAt: s.submittedAt,
          gradedAt: s.gradedAt,
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: assignmentGrades,
    });
  } catch (error) {
    console.error('❌ Get teacher grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message,
    });
  }
};

/**
 * Get detailed grade report for a specific student in a course
 */
exports.getStudentGradeReport = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify teacher is authorized to view this student's grades
    const teacherId = req.user.id;
    
    // Check if teacher teaches this course
    const course = await Course.findById(courseId);
    if (!course || course.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view grades for this course',
      });
    }

    // Check if student is enrolled in this course
    const isEnrolled = course.enrolledStudents.some(
      id => id.toString() === studentId
    );
    
    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course',
      });
    }

    // Find all assignments for this course
    const assignments = await Assignment.find({
      course: courseId,
    }).select('_id title totalPoints');

    // Find all submissions for this student in this course
    const submissions = await Submission.find({
      student: studentId,
      course: courseId,
    })
      .populate('assignment', 'title totalPoints');

    // Create grade report
    const assignmentGrades = assignments.map(assignment => {
      const submission = submissions.find(
        s => s.assignment._id.toString() === assignment._id.toString()
      );
      
      let score = null;
      let percentage = null;
      let letterGrade = null;
      let status = 'not_submitted';
      let submittedAt = null;
      let gradedAt = null;
      let feedback = null;
      
      if (submission) {
        status = submission.status;
        submittedAt = submission.submittedAt;
        score = submission.score;
        feedback = submission.feedback;
        
        if (submission.status === 'graded' && submission.score !== null) {
          percentage = assignment.totalPoints > 0 
            ? Math.round((submission.score / assignment.totalPoints) * 100)
            : 0;
          
          // Determine letter grade
          if (percentage >= 97) letterGrade = 'A+';
          else if (percentage >= 93) letterGrade = 'A';
          else if (percentage >= 90) letterGrade = 'A-';
          else if (percentage >= 87) letterGrade = 'B+';
          else if (percentage >= 83) letterGrade = 'B';
          else if (percentage >= 80) letterGrade = 'B-';
          else if (percentage >= 77) letterGrade = 'C+';
          else if (percentage >= 73) letterGrade = 'C';
          else if (percentage >= 70) letterGrade = 'C-';
          else if (percentage >= 60) letterGrade = 'D';
          else letterGrade = 'F';
        }
        
        gradedAt = submission.gradedAt;
      }

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        maxScore: assignment.totalPoints,
        score: score,
        percentage: percentage,
        letterGrade: letterGrade,
        status: status,
        submittedAt: submittedAt,
        gradedAt: gradedAt,
        feedback: feedback,
      };
    });

    // Calculate overall statistics
    const gradedAssignments = assignmentGrades.filter(a => a.status === 'graded');
    const totalScore = gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0);
    const maxPoints = gradedAssignments.reduce((sum, a) => sum + (a.maxScore || 0), 0);
    const overallPercentage = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 100) : 0;
    
    // Determine overall letter grade
    let overallLetterGrade = 'F';
    if (overallPercentage >= 97) overallLetterGrade = 'A+';
    else if (overallPercentage >= 93) overallLetterGrade = 'A';
    else if (overallPercentage >= 90) overallLetterGrade = 'A-';
    else if (overallPercentage >= 87) overallLetterGrade = 'B+';
    else if (overallPercentage >= 83) overallLetterGrade = 'B';
    else if (overallPercentage >= 80) overallLetterGrade = 'B-';
    else if (overallPercentage >= 77) overallLetterGrade = 'C+';
    else if (overallPercentage >= 73) overallLetterGrade = 'C';
    else if (overallPercentage >= 70) overallLetterGrade = 'C-';
    else if (overallPercentage >= 60) overallLetterGrade = 'D';

    const student = await User.findById(studentId).select('name email');

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
        },
        course: {
          id: course._id.toString(),
          name: course.name,
        },
        assignments: assignmentGrades,
        statistics: {
          totalAssignments: assignments.length,
          completedAssignments: assignmentGrades.filter(a => a.status !== 'not_submitted').length,
          gradedAssignments: gradedAssignments.length,
          totalScore: totalScore,
          maxPoints: maxPoints,
          overallPercentage: overallPercentage,
          overallLetterGrade: overallLetterGrade,
        }
      },
    });
  } catch (error) {
    console.error('❌ Get student grade report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grade report',
      error: error.message,
    });
  }
};
