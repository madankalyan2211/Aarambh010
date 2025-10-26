// Script to verify a test user
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function verifyUser() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to ${conn.connection.name}`);
    
    // Import User model
    const User = require('./server/models/User');
    
    // Find the test user
    const user = await User.findOne({ email: 'curltest@example.com' });
    if (user) {
      console.log('Found user:', user.name);
      console.log('Current verification status:', user.isVerified);
      
      // Verify the user
      user.isVerified = true;
      await user.save();
      console.log('User verified successfully');
    } else {
      console.log('User not found');
    }
    
    await mongoose.connection.close();
    console.log('Done.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyUser();