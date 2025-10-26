const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

async function viewUsers() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');
    
    // Get all users
    const users = await User.find({}).select('-password');
    
    console.log(`📊 Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('No users registered yet. Register your first user!\n');
    } else {
      console.log('👥 Registered Users:\n');
      console.log('═'.repeat(80));
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role.toUpperCase()}`);
        console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
        console.log(`   Registered: ${user.createdAt.toLocaleString()}`);
        console.log(`   ID: ${user._id}`);
      });
      
      console.log('\n' + '═'.repeat(80));
      
      // Statistics
      const students = users.filter(u => u.role === 'student').length;
      const teachers = users.filter(u => u.role === 'teacher').length;
      const admins = users.filter(u => u.role === 'admin').length;
      const verified = users.filter(u => u.isVerified).length;
      
      console.log('\n📈 Statistics:');
      console.log(`   Students: ${students}`);
      console.log(`   Teachers: ${teachers}`);
      console.log(`   Admins: ${admins}`);
      console.log(`   Verified: ${verified}/${users.length}`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewUsers();
