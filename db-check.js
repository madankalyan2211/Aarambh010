// Simple database check
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function checkDB() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to ${conn.connection.name}`);
    
    // Import User model
    const User = require('./server/models/User');
    
    // Count all users
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);
    
    // Count Google users
    const googleCount = await User.countDocuments({ googleId: { $exists: true } });
    console.log(`Google users: ${googleCount}`);
    
    // Count Firebase users
    const firebaseCount = await User.countDocuments({ firebaseId: { $exists: true } });
    console.log(`Firebase users: ${firebaseCount}`);
    
    // Show first user
    const firstUser = await User.findOne();
    if (firstUser) {
      console.log('\nFirst user:');
      console.log(`  Name: ${firstUser.name}`);
      console.log(`  Email: ${firstUser.email}`);
      console.log(`  Role: ${firstUser.role}`);
      console.log(`  Google ID: ${firstUser.googleId || 'None'}`);
      console.log(`  Firebase ID: ${firstUser.firebaseId || 'None'}`);
    }
    
    await mongoose.connection.close();
    console.log('\nDone.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDB();