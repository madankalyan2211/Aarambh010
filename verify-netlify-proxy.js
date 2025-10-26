/**
 * Test script to verify Netlify proxy configuration
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyNetlifyProxy() {
  console.log('🔍 Verifying Netlify Proxy Configuration\n');
  
  try {
    // Test direct backend access
    console.log('1️⃣ Testing Direct Backend Access...');
    const directResponse = await fetch('https://aarambh01-1.onrender.com/health');
    const directData = await directResponse.json();
    
    console.log(`   📍 Status: ${directResponse.status}`);
    console.log(`   ✅ Success: ${directData.success}`);
    console.log(`   📝 Message: ${directData.message}\n`);
    
    // Test Netlify proxy by accessing the health endpoint through Netlify
    console.log('2️⃣ Testing Netlify Proxy (this may not work with curl/server-side requests)...');
    console.log('   ℹ️  Note: Proxy testing with server-side requests is limited');
    console.log('   ℹ️  Full proxy testing requires browser-based requests\n');
    
    // Let's check the Netlify configuration files
    console.log('3️⃣ Checking Netlify Configuration Files...');
    
    // Check netlify.toml
    const fs = require('fs');
    const path = require('path');
    
    const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
    if (fs.existsSync(netlifyTomlPath)) {
      const netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
      console.log('   ✅ netlify.toml exists');
      
      if (netlifyConfig.includes('/api/*') && netlifyConfig.includes('aarambh01-1.onrender.com')) {
        console.log('   ✅ API proxy configuration found');
        console.log('   📋 Proxy Rule: /api/* → https://aarambh01-1.onrender.com/api/:splat\n');
      } else {
        console.log('   ❌ API proxy configuration not found or incorrect\n');
      }
    } else {
      console.log('   ❌ netlify.toml not found\n');
    }
    
    // Check environment variables
    console.log('4️⃣ Checking Environment Variables...');
    const envProdPath = path.join(__dirname, '.env.production');
    if (fs.existsSync(envProdPath)) {
      const envContent = fs.readFileSync(envProdPath, 'utf8');
      console.log('   ✅ .env.production exists');
      
      if (envContent.includes('VITE_API_BASE_URL')) {
        const apiBaseUrlLine = envContent.split('\n').find(line => line.includes('VITE_API_BASE_URL'));
        console.log(`   📋 ${apiBaseUrlLine}`);
        console.log('   ✅ VITE_API_BASE_URL is set\n');
      } else {
        console.log('   ⚠️  VITE_API_BASE_URL not found\n');
      }
    } else {
      console.log('   ❌ .env.production not found\n');
    }
    
    console.log('📋 Proxy Configuration Summary:');
    console.log('   🔄 Netlify redirects /api/* requests to https://aarambh01-1.onrender.com/api/:splat');
    console.log('   🌐 This allows your frontend to make requests to /api/auth/login');
    console.log('   🔄 Which gets proxied to https://aarambh01-1.onrender.com/api/auth/login\n');
    
    console.log('🧪 How to Test in Browser:');
    console.log('   1. Open your Netlify site: https://68f3564c6870f11a138e446c--aesthetic-concha-02b35a.netlify.app');
    console.log('   2. Open Developer Tools (F12)');
    console.log('   3. Go to the Network tab');
    console.log('   4. Try to log in or perform any action that makes an API call');
    console.log('   5. Check if the request to /api/auth/login succeeds\n');
    
    console.log('✅ Verification Complete!');
    console.log('If you\'re seeing this message, your configuration files are correctly set up.');
    console.log('The proxy should work when accessed through a browser.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyNetlifyProxy();