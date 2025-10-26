// Simple script to verify a test user
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function verifyUser() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    
    const User = require('./server/models/User');
    const user = await User.findOne({ email: 'curltest@example.com' });
    if (user) {
      user.isVerified = true;
      await user.save();
      console.log('Verified');
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyUser();