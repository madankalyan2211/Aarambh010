const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function clearUsersNow() {
  try {
    console.log('Clearing all users from database...');
    console.log('');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    console.log('');
    
    // Get current user count
    const userCount = await User.countDocuments();
    console.log('Current users in database: ' + userCount);
    console.log('');
    
    if (userCount === 0) {
      console.log('No users to delete.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Show users
    const users = await User.find().select('name email role');
    console.log('Deleting users:');
    console.log('');
    users.forEach((user, index) => {
      console.log((index + 1) + '. ' + user.email + ' - ' + user.name + ' (' + user.role + ')');
    });
    console.log('');
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log('========================================');
    console.log('Successfully deleted ' + result.deletedCount + ' users');
    console.log('========================================');
    console.log('');
    console.log('All users have been removed from the database.');
    console.log('');
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('Error: ' + error.message);
    process.exit(1);
  }
}

clearUsersNow();
