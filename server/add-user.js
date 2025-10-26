const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function registerUser() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node add-user.js <email> <password> <name> [role]');
      console.log('Example: node add-user.js hello2madan@gmail.com password123 "Madan T" student');
      process.exit(1);
    }
    
    const [email, password, name, role = 'student'] = args;
    
    console.log('Registering user: ' + email);
    console.log('');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    console.log('');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists with this email!');
      console.log('');
      console.log('User details:');
      console.log('   Name: ' + existingUser.name);
      console.log('   Email: ' + existingUser.email);
      console.log('   Role: ' + existingUser.role);
      console.log('   Verified: ' + existingUser.isVerified);
      console.log('');
      
      await mongoose.connection.close();
      process.exit(1);
    }
    
    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isVerified: true,
      isActive: true,
    });
    
    console.log('USER REGISTERED SUCCESSFULLY!');
    console.log('');
    console.log('========================================');
    console.log('Name: ' + user.name);
    console.log('Email: ' + user.email);
    console.log('Role: ' + user.role);
    console.log('Verified: Yes');
    console.log('Active: Yes');
    console.log('ID: ' + user._id);
    console.log('Created: ' + user.createdAt);
    console.log('========================================');
    console.log('');
    console.log('You can now login with these credentials!');
    console.log('');
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('Error: ' + error.message);
    if (error.errors) {
      console.error('');
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error('  - ' + key + ': ' + error.errors[key].message);
      });
    }
    process.exit(1);
  }
}

registerUser();
