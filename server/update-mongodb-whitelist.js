#!/usr/bin/env node

/**
 * MongoDB Atlas IP Whitelist Helper
 * This script provides guidance for updating MongoDB Atlas IP whitelist
 */

console.log('🔧 MongoDB Atlas IP Whitelist Helper\n');

console.log('This script helps you understand how to update your MongoDB Atlas IP whitelist.\n');

console.log('📝 Steps to update your MongoDB Atlas IP whitelist:\n');

console.log('1. Go to MongoDB Atlas Dashboard:');
console.log('   🔗 https://cloud.mongodb.com\n');

console.log('2. Navigate to your cluster:');
console.log('   - Click on "Network Access" in the left sidebar\n');

console.log('3. Add IP Address:');
console.log('   - Click "Add IP Address" button');
console.log('   - You can:');
console.log('     * Add your current IP (Atlas detects it automatically)');
console.log('     * Add a specific IP address');
console.log('     * Add "0.0.0.0/0" to allow connections from anywhere (NOT recommended for production)\n');

console.log('4. For Development:');
console.log('   - Add your current IP address for local development\n');

console.log('5. For Render Deployment:');
console.log('   - Temporarily add "0.0.0.0/0" for testing');
console.log('   - For production, use Render\'s static IPs if available\n');

console.log('6. For Vercel Deployment:');
console.log('   - Add "0.0.0.0/0" since Vercel uses dynamic IPs\n');

console.log('⚠️  Security Recommendations:');
console.log('   - Never use "0.0.0.0/0" in production');
console.log('   - Regularly review and update your whitelist');
console.log('   - Remove IP addresses you no longer use\n');

console.log('✅ Current Status:');
console.log('   Run "npm run test-mongodb" to verify your connection\n');

console.log('📚 Additional Resources:');
console.log('   - MongoDB Atlas Network Access: https://docs.atlas.mongodb.com/security-whitelist/');
console.log('   - MongoDB Security Documentation: https://docs.mongodb.com/manual/security/');