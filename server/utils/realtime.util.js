const { User, Course, Assignment, Notification } = require('../models');

/**
 * Initialize MongoDB Change Streams for real-time updates
 * @param {Object} app - Express app instance with io and connectedUsers
 */
const initializeChangeStreams = (app) => {
  try {
    // Get io instance and connected users from app
    const io = app.get('io');
    const connectedUsers = app.get('connectedUsers');
    
    // Watch for changes in the User collection
    const userChangeStream = User.watch();
    userChangeStream.on('change', (change) => {
      console.log('User collection changed:', change.operationType, change.documentKey);
      
      // Emit event to all connected users
      io.emit('user-data-changed', {
        operationType: change.operationType,
        documentId: change.documentKey._id,
        timestamp: new Date()
      });
    });
    
    // Watch for changes in the Course collection
    const courseChangeStream = Course.watch();
    courseChangeStream.on('change', (change) => {
      console.log('Course collection changed:', change.operationType, change.documentKey);
      
      // Emit event to all connected users
      io.emit('course-data-changed', {
        operationType: change.operationType,
        documentId: change.documentKey._id,
        timestamp: new Date()
      });
    });
    
    // Watch for changes in the Assignment collection
    const assignmentChangeStream = Assignment.watch();
    assignmentChangeStream.on('change', (change) => {
      console.log('Assignment collection changed:', change.operationType, change.documentKey);
      
      // Emit event to all connected users
      io.emit('assignment-data-changed', {
        operationType: change.operationType,
        documentId: change.documentKey._id,
        timestamp: new Date()
      });
    });
    
    // Watch for changes in the Notification collection
    const notificationChangeStream = Notification.watch();
    notificationChangeStream.on('change', (change) => {
      console.log('Notification collection changed:', change.operationType, change.documentKey);
      
      // If this is an insert operation and we have a recipient, emit to that user
      if (change.operationType === 'insert' && change.fullDocument?.recipient) {
        const recipientId = change.fullDocument.recipient.toString();
        const recipientSocketId = connectedUsers.get(recipientId);
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new-notification', {
            notification: change.fullDocument
          });
        }
      }
      
      // Emit general notification change event
      io.emit('notification-data-changed', {
        operationType: change.operationType,
        documentId: change.documentKey._id,
        timestamp: new Date()
      });
    });
    
    console.log('✅ MongoDB Change Streams initialized successfully');
    
    // Handle change stream errors
    userChangeStream.on('error', (error) => {
      console.error('❌ User change stream error:', error);
    });
    
    courseChangeStream.on('error', (error) => {
      console.error('❌ Course change stream error:', error);
    });
    
    assignmentChangeStream.on('error', (error) => {
      console.error('❌ Assignment change stream error:', error);
    });
    
    notificationChangeStream.on('error', (error) => {
      console.error('❌ Notification change stream error:', error);
    });
    
  } catch (error) {
    console.error('❌ Error initializing MongoDB Change Streams:', error);
  }
};

module.exports = {
  initializeChangeStreams
};