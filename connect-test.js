// Simple connection test
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not found');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

connectDB();