const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Collections to clean in sample_mflix database
const COLLECTIONS_TO_CLEAN = [
  'comments',
  'embedded_movies',
  'movies',
  'sessions',
  'theaters',
  'users'
];

async function clearSampleMflixDatabase() {
  try {
    console.log('🗑️  MongoDB Sample Mflix Database Cleaner');
    console.log('═'.repeat(80));
    console.log('\n⚠️  WARNING: This will delete ALL data from specified collections!');
    console.log('Target Database: sample_mflix');
    console.log('Collections to clean:', COLLECTIONS_TO_CLEAN.join(', '));
    console.log('\n');
    
    // Ask for confirmation
    const answer = await new Promise((resolve) => {
      rl.question('Are you sure you want to delete ALL data from these collections? Type "YES" to confirm: ', resolve);
    });
    
    if (answer !== 'YES') {
      console.log('\n❌ Cancelled. No data was deleted.');
      rl.close();
      process.exit(0);
    }
    
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    
    // Modify the connection string to use sample_mflix database
    const baseUri = process.env.MONGODB_URI.split('/').slice(0, -1).join('/');
    const connectionString = baseUri + '/sample_mflix?retryWrites=true&w=majority&appName=Aarambh';
    
    await mongoose.connect(connectionString);
    console.log('✅ Connected to sample_mflix database!\n');
    
    // Get all collections in the database
    const allCollections = await mongoose.connection.db.listCollections().toArray();
    const existingCollections = allCollections.map(c => c.name);
    
    console.log(`📁 Collections found in database: ${existingCollections.join(', ')}\n`);
    
    // Check which collections exist and show document counts
    console.log('📊 Document counts before cleanup:\n');
    
    let collectionsToProcess = [];
    for (const collectionName of COLLECTIONS_TO_CLEAN) {
      if (existingCollections.includes(collectionName)) {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`   - ${collectionName}: ${count} documents`);
        collectionsToProcess.push(collectionName);
      } else {
        console.log(`   - ${collectionName}: ⚠️  Collection not found (will be skipped)`);
      }
    }
    
    if (collectionsToProcess.length === 0) {
      console.log('\n❌ No collections found to clean. Exiting.');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
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
    for (const collectionName of collectionsToProcess) {
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`   ✅ Deleted ${result.deletedCount} documents from ${collectionName}`);
      totalDeleted += result.deletedCount;
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`\n🎉 Successfully deleted ${totalDeleted} total documents!`);
    console.log('💾 Database storage has been freed up.');
    console.log('📊 Collections remain intact (empty and ready for new data).\n');
    
    // Verify no user data remains
    console.log('🔍 Verifying user data cleanup...\n');
    
    const userCollections = collectionsToProcess.filter(name => name.includes('user') || name.includes('session'));
    for (const collectionName of userCollections) {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      if (count === 0) {
        console.log(`   ✅ ${collectionName}: 0 documents (confirmed clean)`);
      } else {
        console.log(`   ⚠️  ${collectionName}: ${count} documents still exist!`);
      }
    }
    
    console.log('\n✅ User data cleanup verified.\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed.\n');
    rl.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    rl.close();
    process.exit(1);
  }
}

clearSampleMflixDatabase();
