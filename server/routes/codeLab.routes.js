const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const https = require('https');
const { URL } = require('url');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config();

// JDoodle API configuration - Load from environment variables
const JDoodle_API_URL = 'https://api.jdoodle.com/v1/execute';
const JDoodle_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '970044049584274a32d76fcdcc6a6d2f';
const JDoodle_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '16ebe3988f39f7e72d03476f0dcf54487a3e84d8a1b1b20d3d5cdee791f625dd';

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const sslOptions = {
  rejectUnauthorized: false, // Temporarily disable strict SSL validation
  ciphers: 'HIGH:!DH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

// Add CA certificate in production if needed
if (isProduction && process.env.SSL_CA_PATH) {
  try {
    sslOptions.ca = fs.readFileSync(process.env.SSL_CA_PATH);
  } catch (error) {
    console.error('Failed to read SSL CA certificate:', error);
  }
}

// Create HTTPS agent with production-ready settings
const httpsAgent = new https.Agent(sslOptions);

// Execute code using JDoodle API
router.post('/execute', protect, async (req, res) => {
  try {
    console.log('🔍 CodeLab Route - User info:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });
    
    const { script, language, versionIndex } = req.body;
    
    console.log('🔍 CodeLab Route - Executing code for user:', req.user.id);
    
    // Validate input
    if (!script || !language) {
      return res.status(400).json({
        success: false,
        message: 'Script and language are required'
      });
    }
    
    // Prepare the request payload
    const payload = {
      clientId: JDoodle_CLIENT_ID,
      clientSecret: JDoodle_CLIENT_SECRET,
      script,
      language,
      versionIndex: versionIndex || "0"
    };
    
    console.log('🚀 Sending code to JDoodle API with payload:', {
      clientId: payload.clientId,
      clientSecret: payload.clientSecret ? '[REDACTED]' : undefined,
      language: payload.language,
      versionIndex: payload.versionIndex
    });
    
    // Make the API request to JDoodle using https module directly
    const response = await new Promise((resolve, reject) => {
      const url = new URL(JDoodle_API_URL);
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        agent: httpsAgent,
        timeout: 15000 // 15 second timeout
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          res.body = data;
          resolve(res);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Set a timeout
      req.setTimeout(15000, () => {
        req.destroy(new Error('Request timeout'));
      });

      // Write data to request body
      req.write(JSON.stringify(payload));
      req.end();
    });
    
    let responseData;
    try {
      responseData = JSON.parse(response.body || '{}');
    } catch (e) {
      console.error('Error parsing JDoodle response:', e);
      responseData = { error: 'Invalid response from code execution service' };
    }

    // Check for SSL handshake errors
    if (response.statusCode === 525 || 
        (response.body && response.body.includes('SSL handshake failed')) ||
        (response.body && response.body.includes('certificate has expired'))) {
      return res.status(503).json({
        success: false,
        message: 'Code execution service is temporarily unavailable due to SSL connection issues',
        error: 'The code execution service (JDoodle) is experiencing SSL connection problems. This is a known issue and our team is working to resolve it. Please try again later.'
      });
    }
    
    // Check for non-200 status codes
    if (response.statusCode !== 200) {
      const errorMessage = responseData.error || response.statusMessage || 'Unknown error';
      console.log('❌ Code execution failed with status:', response.statusCode, 'Error:', errorMessage);
      return res.status(400).json({
        success: false,
        message: 'Code execution failed',
        error: errorMessage
      });
    }
    
    // Check if response contains an error
    if (responseData.error) {
      console.log('❌ Code execution failed with error:', responseData.error);
      return res.status(400).json({
        success: false,
        message: 'Code execution failed',
        error: responseData.error
      });
    }
    
    // If we get here, the execution was successful
    console.log('✅ Code execution successful for user:', req.user.email);
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Error executing code:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    
    // Handle timeout errors
    if (error.message === 'Request timeout' || error.code === 'ECONNABORTED') {
      console.error('❌ Code execution timeout error');
      return res.status(408).json({
        success: false,
        message: 'Code execution timed out',
        error: 'The code execution took too long and was cancelled. Please try with a simpler program.'
      });
    }
    
    // Handle network errors specifically
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Code execution network error:', error.code);
      return res.status(503).json({
        success: false,
        message: 'Code execution service is temporarily unavailable',
        error: 'Unable to connect to the code execution service. Please try again later.'
      });
    }
    
    // Handle SSL/TLS errors
    if (error.code === 'CERT_HAS_EXPIRED' || 
        error.code === 'CERT_NOT_YET_VALID' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.message.includes('SSL') ||
        error.message.includes('TLS') ||
        error.message.includes('certificate')) {
      console.error('❌ Code execution SSL/TLS error:', error.code, error.message);
      return res.status(503).json({
        success: false,
        message: 'Code execution service is temporarily unavailable due to SSL/TLS issues',
        error: 'The code execution service is experiencing SSL/TLS connection problems. Please try again later.'
      });
    }
    
    // Handle fetch errors
    if (error.message.includes('fetch failed') || error.message.includes('ECONNRESET')) {
      console.error('❌ Code execution connection reset error');
      return res.status(503).json({
        success: false,
        message: 'Code execution service connection failed',
        error: 'Failed to connect to the code execution service. Please try again later.'
      });
    }
    
    console.error('❌ Unexpected error in code execution:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing code',
      error: error.message
    });
  }
});

// Add a health check endpoint for the code lab service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CodeLab service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;