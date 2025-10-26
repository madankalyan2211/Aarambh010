const express = require('express');
const router = express.Router();
const https = require('https');
const { URL } = require('url');
const rateLimit = require('express-rate-limit');

// Rate limiting for RSS feed requests
const rssLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';

// Create HTTPS agent with appropriate SSL settings for production
const sslOptions = {
  rejectUnauthorized: !isProduction, // Enable strict SSL validation in production
  ciphers: 'HIGH:!DH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

// Add CA certificate in production if needed
if (isProduction && process.env.SSL_CA_PATH) {
  try {
    const fs = require('fs');
    sslOptions.ca = fs.readFileSync(process.env.SSL_CA_PATH);
  } catch (error) {
    console.error('Failed to read SSL CA certificate:', error);
  }
}

const httpsAgent = new https.Agent(sslOptions);

/**
 * Health check endpoint for RSS service
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RSS service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Fetch RSS feed from a given URL
 * Apply rate limiting to prevent abuse
 */
router.get('/tech-updates', rssLimiter, async (req, res) => {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=technology+ai+machine+learning&hl=en-US&gl=US&ceid=US:en';
    
    // Make the API request using https module directly
    const response = await new Promise((resolve, reject) => {
      const url = new URL(rssUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        agent: httpsAgent,
        timeout: 10000 // 10 second timeout for production
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Set a timeout
      req.setTimeout(10000, () => {
        req.destroy(new Error('Request timeout'));
      });

      req.end();
    });
    
    // Check for non-200 status codes
    if (response.statusCode !== 200) {
      console.warn(`RSS feed request failed with status ${response.statusCode}`);
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch RSS feed from upstream service',
        error: `HTTP ${response.statusCode}`
      });
    }
    
    // Validate that we received XML content
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('xml') && !contentType.includes('text')) {
      console.warn('RSS feed response has unexpected content type:', contentType);
      return res.status(502).json({
        success: false,
        message: 'Invalid response from RSS feed service',
        error: 'Unexpected content type'
      });
    }
    
    // Return the RSS feed content
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900'); // Cache for 15 minutes
    res.status(200).send(response.body);
  } catch (error) {
    console.error('❌ Error fetching RSS feed:', error);
    
    // Handle timeout errors
    if (error.message === 'Request timeout' || error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'RSS feed request timed out',
        error: 'The request to fetch the RSS feed took too long and was cancelled.'
      });
    }
    
    // Handle network errors specifically
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'RSS feed service is temporarily unavailable',
        error: 'Unable to connect to the RSS feed service. Please try again later.'
      });
    }
    
    // Handle SSL/TLS errors
    if (error.code === 'CERT_HAS_EXPIRED' || 
        error.code === 'CERT_NOT_YET_VALID' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.message.includes('SSL') ||
        error.message.includes('TLS') ||
        error.message.includes('certificate')) {
      return res.status(503).json({
        success: false,
        message: 'RSS feed service is temporarily unavailable due to SSL/TLS issues',
        error: 'The RSS feed service is experiencing SSL/TLS connection problems. Please try again later.'
      });
    }
    
    console.error('❌ Unexpected error in RSS feed fetch:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RSS feed',
      error: error.message
    });
  }
});

module.exports = router;