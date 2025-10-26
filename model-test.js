// Test User model import
console.log('Testing User model import...');

try {
  const User = require('./server/models/User');
  console.log('✅ User model imported successfully');
  console.log('User model type:', typeof User);
  console.log('User model keys:', Object.keys(User));
} catch (error) {
  console.error('❌ Error importing User model:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('Done.');