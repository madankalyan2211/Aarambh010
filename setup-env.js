#!/usr/bin/env node

/**
 * Environment Variables Setup Helper
 * This script helps set up environment variables for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aarambh LMS Environment Variables Setup Helper\n');

// Check if .env files exist
const backendEnvPath = path.join(__dirname, 'server', '.env.production');
const frontendEnvPath = path.join(__dirname, '.env.production');

if (!fs.existsSync(backendEnvPath) || !fs.existsSync(frontendEnvPath)) {
  console.log('❌ Required .env.production files not found!');
  console.log('Please ensure you have the deployment files in place.');
  process.exit(1);
}

console.log('This helper will guide you through setting up environment variables for deployment.');
console.log('You will need to provide the following information:\n');

console.log('Backend (Render) required variables:');
console.log('  - MongoDB URI');
console.log('  - JWT Secret');
console.log('  - Gmail credentials');
console.log('  - API Secret Key');
console.log('  - AI API Keys (optional)\n');

console.log('Frontend (Vercel) required variables:');
console.log('  - Backend API URL\n');

console.log('📝 Note: This script will show you what to update in your .env files.');
console.log('   You will need to manually edit the files with your actual values.\n');

// Backend variables
console.log('=== BACKEND VARIABLES (server/.env.production) ===\n');

console.log('Update these variables in server/.env.production:\n');

console.log('# MongoDB Atlas Configuration');
console.log('MONGODB_URI=your_mongodb_uri_here\n');

console.log('# JWT Configuration');
console.log('JWT_SECRET=your_jwt_secret_here_change_in_production\n');

console.log('# Gmail Configuration');
console.log('GMAIL_USER=your_gmail_user_here');
console.log('GMAIL_APP_PASSWORD=your_app_password_here\n');

console.log('# CORS Configuration (Update after frontend deployment)');
console.log('ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app\n');

console.log('# Security');
console.log('API_SECRET_KEY=your_secret_key_here_change_in_production\n');

console.log('# AI API Configuration (optional)');
console.log('GEMINI_API_KEY=your_gemini_api_key_here');
console.log('GROQ_API_KEY=your_groq_api_key_here\n');

// Frontend variables
console.log('=== FRONTEND VARIABLES (.env.production) ===\n');

console.log('Update these variables in .env.production:\n');

console.log('# API Configuration (Update after backend deployment)');
console.log('VITE_API_BASE_URL=https://your-render-app-url.onrender.com/api\n');

console.log('# Application Environment');
console.log('VITE_APP_ENV=production');
console.log('VITE_DEBUG_MODE=false');
console.log('VITE_APP_URL=https://your-vercel-app.vercel.app\n');

console.log('📝 Instructions:');
console.log('1. Edit server/.env.production with your actual backend values');
console.log('2. Deploy your backend to Render');
console.log('3. Note the Render app URL');
console.log('4. Edit .env.production with your actual frontend values');
console.log('5. Deploy your frontend to Vercel');
console.log('6. Update the ALLOWED_ORIGINS in Render with your Vercel app URL\n');

console.log('✅ Setup complete! Review the DEPLOYMENT_GUIDE.md for detailed deployment instructions.');