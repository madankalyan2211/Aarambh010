const mongoose = require('mongoose');
require('dotenv').config();

// Collections to check in sample_mflix database
const COLLECTIONS_TO_CHECK = [
  'comments',
  'embedded_movies',
  'movies',
  'sessions',
  'theaters',
  'users'
];

async function checkSampleMflixDatabase() {
  try {
    console.log('🔍 MongoDB Sample Mflix Database Inspector');
    console.log('═'.repeat(80));
    console.log('\nTarget Database: sample_mflix\n');
    
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    // Modify the connection string to use sample_mflix database
    const baseUri = process.env.MONGODB_URI.split('/').slice(0, -1).join('/');
    const connectionString = baseUri + '/sample_mflix?retryWrites=true&w=majority&appName=Aarambh';
    
    await mongoose.connect(connectionString);
    console.log('✅ Connected to sample_mflix database!\n');
    
    // Get all collections in the database
    const allCollections = await mongoose.connection.db.listCollections().toArray();
    const existingCollections = allCollections.map(c => c.name);
    
    console.log(`📁 All collections in database: ${existingCollections.join(', ')}\n`);
    
    // Check target collections
    console.log('📊 Document counts in target collections:\n');
    
    let totalDocuments = 0;
    for (const collectionName of COLLECTIONS_TO_CHECK) {
      if (existingCollections.includes(collectionName)) {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`   - ${collectionName}: ${count} documents`);
        totalDocuments += count;
      } else {
        console.log(`   - ${collectionName}: ⚠️  Collection not found`);
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`\nTotal documents in target collections: ${totalDocuments}\n`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

checkSampleMflixDatabase();
