const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearUsers() {
  try {
    console.log('WARNING: Clear All Users');
    console.log('========================================');
    console.log('');
    console.log('This will DELETE ALL USERS from the database!');
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
      rl.close();
      process.exit(0);
    }
    
    // Show users
    const users = await User.find().select('name email role');
    console.log('Users to be deleted:');
    console.log('');
    users.forEach((user, index) => {
      console.log((index + 1) + '. ' + user.email + ' - ' + user.name + ' (' + user.role + ')');
    });
    console.log('');
    
    // Ask for confirmation
    const answer = await new Promise((resolve) => {
      rl.question('Type "DELETE ALL" to confirm deletion: ', resolve);
    });
    
    if (answer !== 'DELETE ALL') {
      console.log('');
      console.log('Cancelled. No users were deleted.');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    }
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log('');
    console.log('========================================');
    console.log('Deleted ' + result.deletedCount + ' users');
    console.log('========================================');
    console.log('');
    console.log('All users have been removed from the database.');
    console.log('');
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    console.log('');
    rl.close();
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('Error: ' + error.message);
    rl.close();
    process.exit(1);
  }
}

clearUsers();
