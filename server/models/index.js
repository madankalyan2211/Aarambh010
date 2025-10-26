// Export all models from a single file for easy importing

const User = require('./User');
const Course = require('./Course');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Discussion = require('./Discussion');
const Notification = require('./Notification');
const Message = require('./Message');
const Conversation = require('./Conversation');
const Announcement = require('./Announcement');
const Quiz = require('./Quiz');
const QuizSubmission = require('./QuizSubmission');

module.exports = {
  User,
  Course,
  Assignment,
  Submission,
  Discussion,
  Notification,
  Message,
  Conversation,
  Announcement,
  Quiz,
  QuizSubmission,
};