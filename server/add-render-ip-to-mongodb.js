#!/usr/bin/env node

/**
 * Add Render IP to MongoDB Atlas Whitelist
 * This script demonstrates how to programmatically add IP addresses to MongoDB Atlas
 */

console.log('🔧 Render IP to MongoDB Atlas Whitelist Helper\n');

console.log('📝 To programmatically add Render IPs to MongoDB Atlas, you need:\n');

console.log('1. MongoDB Atlas API Key:');
console.log('   - Go to MongoDB Atlas');
console.log('   - Navigate to "Access Manager" > "API Keys"');
console.log('   - Create a new API key with "Project Owner" permissions');
console.log('   - Save the Public and Private keys securely\n');

console.log('2. Required Environment Variables:');
console.log('   - ATLAS_PUBLIC_KEY=your_public_key');
console.log('   - ATLAS_PRIVATE_KEY=your_private_key');
console.log('   - ATLAS_PROJECT_ID=your_project_id\n');

console.log('3. Example Code Structure:');
console.log(`
   const axios = require('axios');
   
   async function addIPToWhitelist(ipAddress, comment) {
     const publicKey = process.env.ATLAS_PUBLIC_KEY;
     const privateKey = process.env.ATLAS_PRIVATE_KEY;
     const projectId = process.env.ATLAS_PROJECT_ID;
     
     const url = \`https://cloud.mongodb.com/api/atlas/v1.0/groups/\${projectId}/accessList\`;
     
     const auth = {
       username: publicKey,
       password: privateKey
     };
     
     const data = {
       awsSecurityGroup: "",
       ipAddress: ipAddress,
       comment: comment
     };
     
     try {
       const response = await axios.post(url, data, { auth });
       console.log('✅ IP added successfully:', response.data);
     } catch (error) {
       console.error('❌ Error adding IP:', error.response.data);
     }
   }
   
   // Usage
   addIPToWhitelist('0.0.0.0/0', 'Allow all IPs for Render deployment');
`);

console.log('\n4. Alternative Solutions:');
console.log('   - Use MongoDB Atlas Private Endpoints (enterprise feature)');
console.log('   - Deploy a proxy service with static IP');
console.log('   - Upgrade to Render paid plan with static IPs\n');

console.log('📚 Resources:');
console.log('   - MongoDB Atlas API Documentation: https://docs.atlas.mongodb.com/reference/api/');
console.log('   - Render Networking Documentation: https://render.com/docs/static-ips');