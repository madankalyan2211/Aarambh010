const mongoose = require('mongoose');
const { User } = require('./models');

// Load environment variables
require('dotenv').config({ path: './.env' });

// Fix the private key format issue
const fixedPrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Hide credentials in the connection string for logging
    const connectionString = process.env.MONGODB_URI?.replace(/\/\/(.*?):(.*?)@/, '//*****:*****@');
    console.log(`🔗 Connection string: ${connectionString}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔢 Connection readyState: ${mongoose.connection.readyState}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Test function to manually verify a user
const verifyUserEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }
    
    console.log('👤 Found user:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified}`);
    
    // Manually verify the user for testing
    user.isVerified = true;
    await user.save();
    
    console.log('✅ User email verified successfully');
  } catch (error) {
    console.error('❌ Error verifying user:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  // Verify the test user
  await verifyUserEmail('teamaarambh01@gmail.com');
  
  // Close the connection
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed');
  process.exit(0);
};

main();