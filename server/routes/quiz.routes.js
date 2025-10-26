const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Course = require('../models/Course');
const { generateQuizQuestions } = require('../services/ollama.service');

// Get quizzes for student based on enrolled courses (auto-generated with Ollama)
router.get('/student', protect, async (req, res) => {
  try {
    console.log('🔍 Quiz Route - Fetching quizzes for student:', req.user.id);
    
    // Get student's enrolled courses
    const studentCourses = await Course.find({ enrolledStudents: req.user.id });
    console.log('📚 Student enrolled in courses:', studentCourses.length);
    
    // Generate quizzes automatically based on course content
    const quizzes = [];
    
    for (const course of studentCourses) {
      // Create a comprehensive course content summary for Ollama
      let courseContent = `Course: ${course.name}\nDescription: ${course.description}\n\n`;
      
      // Add module and lesson information
      course.modules.forEach((module, moduleIndex) => {
        courseContent += `Module ${moduleIndex + 1}: ${module.title}\n`;
        courseContent += `Description: ${module.description}\n`;
        
        module.lessons.forEach((lesson, lessonIndex) => {
          courseContent += `  Lesson ${lessonIndex + 1}: ${lesson.title} (${lesson.type})\n`;
          if (lesson.duration) {
            courseContent += `  Duration: ${lesson.duration} minutes\n`;
          }
        });
        courseContent += '\n';
      });
      
      // Generate AI-powered questions using Ollama
      const aiQuestions = await generateQuizQuestions(courseContent, 10);
      
      // Create the quiz object
      const quiz = {
        id: `auto-${course._id}`,
        title: `${course.name} - Knowledge Check`,
        description: `Test your knowledge of the ${course.name} course content`,
        courseId: course._id,
        courseName: course.name,
        questions: aiQuestions,
        duration: Math.max(5, Math.min(30, aiQuestions.length * 2)), // 2 minutes per question, min 5, max 30
        attemptsAllowed: 3,
        passingScore: 70,
        published: true,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
      
      quizzes.push(quiz);
    }
    
    console.log('📝 Generated quizzes:', quizzes.length);
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error generating quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating quizzes',
      error: error.message
    });
  }
});

// Get a specific quiz by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Check if this is an auto-generated quiz (starts with "auto-")
    if (quizId.startsWith('auto-')) {
      // Extract the course ID from the quiz ID
      const courseId = quizId.replace('auto-', '');
      
      // Get the course
      const course = await Course.findById(courseId).populate('teacher', 'name');
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if student is enrolled in the course
      const isEnrolled = course.enrolledStudents.some(
        studentId => studentId.toString() === req.user.id
      );
      
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      
      // Create a comprehensive course content summary for Ollama
      let courseContent = `Course: ${course.name}\nDescription: ${course.description}\n\n`;
      
      // Add module and lesson information
      course.modules.forEach((module, moduleIndex) => {
        courseContent += `Module ${moduleIndex + 1}: ${module.title}\n`;
        courseContent += `Description: ${module.description}\n`;
        
        module.lessons.forEach((lesson, lessonIndex) => {
          courseContent += `  Lesson ${lessonIndex + 1}: ${lesson.title} (${lesson.type})\n`;
          if (lesson.duration) {
            courseContent += `  Duration: ${lesson.duration} minutes\n`;
          }
        });
        courseContent += '\n';
      });
      
      // Generate AI-powered questions using Ollama
      const aiQuestions = await generateQuizQuestions(courseContent, 10);
      
      // Create the quiz object
      const quiz = {
        _id: quizId,
        id: quizId,
        title: `${course.name} - Knowledge Check`,
        description: `Test your knowledge of the ${course.name} course content`,
        courseId: course._id,
        courseName: course.name,
        questions: aiQuestions,
        duration: Math.max(5, Math.min(30, aiQuestions.length * 2)), // 2 minutes per question, min 5, max 30
        attemptsAllowed: 3,
        passingScore: 70,
        published: true,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
      
      res.json({
        success: true,
        data: quiz
      });
    } else {
      // Handle regular quizzes (saved in database)
      const quiz = await Quiz.findById(quizId).populate('courseId', 'name');
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      // For students, only return quiz if it's published
      if (req.user.role === 'student' && !quiz.published) {
        return res.status(403).json({
          success: false,
          message: 'This quiz is not available yet'
        });
      }
      
      // For students, check if they're enrolled in the course
      if (req.user.role === 'student') {
        const course = await Course.findOne({ 
          _id: quiz.courseId._id || quiz.courseId, 
          enrolledStudents: req.user.id 
        });
        
        if (!course) {
          return res.status(403).json({
            success: false,
            message: 'You are not enrolled in this course'
          });
        }
      }
      
      res.json({
        success: true,
        data: quiz
      });
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
});

// Submit a quiz (Student only) - Modified for auto-generated quizzes
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    
    // Check if this is an auto-generated quiz (starts with "auto-")
    if (quizId.startsWith('auto-')) {
      // Extract the course ID from the quiz ID
      const courseId = quizId.replace('auto-', '');
      
      // Get the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if student is enrolled in the course
      const isEnrolled = course.enrolledStudents.some(
        studentId => studentId.toString() === req.user.id
      );
      
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      
      // Create a comprehensive course content summary for Ollama
      let courseContent = `Course: ${course.name}\nDescription: ${course.description}\n\n`;
      
      // Add module and lesson information
      course.modules.forEach((module, moduleIndex) => {
        courseContent += `Module ${moduleIndex + 1}: ${module.title}\n`;
        courseContent += `Description: ${module.description}\n`;
        
        module.lessons.forEach((lesson, lessonIndex) => {
          courseContent += `  Lesson ${lessonIndex + 1}: ${lesson.title} (${lesson.type})\n`;
          if (lesson.duration) {
            courseContent += `  Duration: ${lesson.duration} minutes\n`;
          }
        });
        courseContent += '\n';
      });
      
      // Generate AI-powered questions using Ollama (to match the questions during submission)
      const aiQuestions = await generateQuizQuestions(courseContent, 10);
      
      // Limit questions to match the answers length
      const limitedQuestions = aiQuestions.slice(0, Math.min(aiQuestions.length, answers.length));
      
      // Calculate score
      let correctAnswers = 0;
      limitedQuestions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = correctAnswers;
      const percentage = Math.round((correctAnswers / limitedQuestions.length) * 100);
      const passed = percentage >= 70; // Default passing score
      
      // For auto-generated quizzes, we don't save submissions to the database
      // but we still return the results
      
      res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          score,
          percentage,
          passed,
          totalQuestions: limitedQuestions.length
        }
      });
    } else {
      // Handle regular quizzes (saved in database)
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      // Check if quiz is published
      if (!quiz.published) {
        return res.status(403).json({
          success: false,
          message: 'This quiz is not available yet'
        });
      }
      
      // Check if student is enrolled in the course
      const course = await Course.findOne({ 
        _id: quiz.courseId, 
        enrolledStudents: req.user.id 
      });
      
      if (!course) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      
      // Check if student has attempts left
      const submissionCount = await QuizSubmission.countDocuments({
        quizId: quiz._id,
        studentId: req.user.id
      });
      
      if (submissionCount >= quiz.attemptsAllowed) {
        return res.status(403).json({
          success: false,
          message: 'You have used all your attempts for this quiz'
        });
      }
      
      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = correctAnswers;
      const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
      const passed = percentage >= quiz.passingScore;
      
      // Create submission
      const submission = new QuizSubmission({
        quizId: quiz._id,
        studentId: req.user.id,
        courseId: quiz.courseId,
        answers: answers.map((answer, index) => ({
          questionId: quiz.questions[index]._id,
          selectedOption: answer
        })),
        score,
        percentage,
        passed
      });
      
      await submission.save();
      
      res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          submission,
          score,
          percentage,
          passed,
          totalQuestions: quiz.questions.length
        }
      });
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
});

// Get quiz submissions for a student
router.get('/submissions/student', protect, async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ studentId: req.user.id })
      .populate('quizId', 'title courseId')
      .populate('courseId', 'name');
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz submissions',
      error: error.message
    });
  }
});

module.exports = router;