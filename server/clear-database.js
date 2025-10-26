const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearDatabase() {
  try {
    console.log('🗑️  MongoDB Database Cleaner');
    console.log('═'.repeat(80));
    console.log('\n⚠️  WARNING: This will delete ALL data from your database!');
    console.log('Database:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('Database Name: aarambh-lms\n');
    
    // Ask for confirmation
    const answer = await new Promise((resolve) => {
      rl.question('Are you sure you want to delete ALL data? Type "YES" to confirm: ', resolve);
    });
    
    if (answer !== 'YES') {
      console.log('\n❌ Cancelled. No data was deleted.');
      rl.close();
      process.exit(0);
    }
    
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('ℹ️  Database is already empty. No collections found.\n');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    }
    
    console.log(`📁 Found ${collections.length} collections:\n`);
    
    // Show what will be deleted
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    // Final confirmation
    const finalAnswer = await new Promise((resolve) => {
      rl.question('\nType "DELETE" to permanently delete all this data: ', resolve);
    });
    
    if (finalAnswer !== 'DELETE') {
      console.log('\n❌ Cancelled. No data was deleted.');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    }
    
    console.log('\n🗑️  Deleting data...\n');
    
    let totalDeleted = 0;
    
    // Delete all documents from each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`   ✅ Deleted ${result.deletedCount} documents from ${collectionName}`);
      totalDeleted += result.deletedCount;
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`\n🎉 Successfully deleted ${totalDeleted} total documents!`);
    console.log('💾 Database storage has been freed up.');
    console.log('📊 Collections remain intact (empty and ready for new data).\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed.\n');
    rl.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

clearDatabase();
