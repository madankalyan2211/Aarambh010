#!/usr/bin/env node

/**
 * Deployment Files Checker
 * This script checks if all required files for deployment are present
 */

const fs = require('fs');
const path = require('path');

// Files that should exist for proper deployment
const requiredFiles = [
  'server/render.yaml',
  'server/.env.production',
  'server/build.sh',
  'server/start-server.sh',
  'vercel.json',
  '.env.production',
  'build.sh',
  'DEPLOYMENT_GUIDE.md',
  'DEPLOYMENT_FILES_SUMMARY.md'
];

// Files that should exist and be modified
const modifiedFiles = [
  'server/server.js',
  'server/package.json',
  'README.md'
];

console.log('🔍 Checking deployment files...\n');

let allFilesPresent = true;

// Check required files
console.log('📋 Required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
    allFilesPresent = false;
  }
});

console.log('\n📝 Modified files:');
modifiedFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
    allFilesPresent = false;
  }
});

console.log('\n📊 Summary:');
if (allFilesPresent) {
  console.log('  ✅ All deployment files are present');
  console.log('  🚀 Ready for deployment to Render and Vercel');
} else {
  console.log('  ❌ Some deployment files are missing');
  console.log('  📚 Please check the DEPLOYMENT_GUIDE.md for instructions');
}

console.log('\n💡 Next steps:');
console.log('  1. Review the DEPLOYMENT_GUIDE.md for detailed instructions');
console.log('  2. Set up your Render account for backend deployment');
console.log('  3. Set up your Vercel account for frontend deployment');
console.log('  4. Configure environment variables for both platforms');