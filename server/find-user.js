const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function findUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node find-user.js <email>');
      process.exit(1);
    }
    
    console.log(`🔍 Searching for user: ${email}\n`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Search for user (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (user) {
      console.log('✅ USER FOUND!\n');
      console.log('═'.repeat(80));
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`ID: ${user._id}`);
      console.log(`Has Password: ${user.password ? '✅' : '❌'}`);
      console.log(`OTP: ${user.otp ? JSON.stringify(user.otp) : 'None'}`);
      console.log('═'.repeat(80));
    } else {
      console.log('❌ USER NOT FOUND\n');
      console.log('Possible reasons:');
      console.log('1. Registration did not complete successfully');
      console.log('2. Email was entered differently during registration');
      console.log('3. Database connection issue during registration');
      console.log('4. Validation error prevented user creation\n');
      
      // Search for similar emails
      console.log('Searching for similar emails...\n');
      const similarUsers = await User.find({
        email: { $regex: email.split('@')[0], $options: 'i' }
      });
      
      if (similarUsers.length > 0) {
        console.log('📧 Found similar email addresses:\n');
        similarUsers.forEach((u, i) => {
          console.log(`${i + 1}. ${u.email} (${u.name}) - ${u.role}`);
        });
      } else {
        console.log('No similar emails found.\n');
      }
      
      // Show all users
      console.log('\n📋 All registered users:\n');
      const allUsers = await User.find().select('name email role createdAt');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} - ${u.name} (${u.role}) - ${u.createdAt.toLocaleDateString()}`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

findUser();
