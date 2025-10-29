// Aarambh LMS Backend Server - Force Redeployment 2025-10-29
const express = require('express');
const cors = require('cors');
const http = require('http');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const gradeRoutes = require('./routes/grade.routes');
const discussionRoutes = require('./routes/discussion.routes');
const userRoutes = require('./routes/users.routes');
const messageRoutes = require('./routes/message.routes');
const announcementRoutes = require('./routes/announcement.routes');
const quizRoutes = require('./routes/quiz.routes');
const codeLabRoutes = require('./routes/codeLab.routes');
const googleRoutes = require('./routes/google.routes');
const rssRoutes = require('./routes/rss.routes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// Auth0 configuration - DISABLED for now
let useAuth0 = false;
console.log('ℹ️  Auth0 is disabled - using direct Google OAuth');

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or if it's a local request or a vercel app
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:5175',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5175',
        'https://aarambh-frontend.vercel.app',
        'https://aarambh-git-main-madantambisetty.vercel.app',
        'https://aarambh.vercel.app'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || 
          origin?.startsWith('http://localhost:') || 
          origin?.startsWith('http://127.0.0.1:') ||
          origin?.endsWith('.vercel.app') ||
          origin?.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }
});

// Store connected users
const connectedUsers = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // When a user connects, store their user ID
  socket.on('register-user', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users map
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Make io available to other modules
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'https://aarambh-frontend.vercel.app',
  'https://aarambh-git-main-madantambisetty.vercel.app',
  'https://aarambh.vercel.app',
  'https://main.du547ljv1ya6v.amplifyapp.com',
  'https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com',
  'https://aarambh-01.web.app' // Add Firebase Hosting domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or if it's a local request or a vercel app
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin?.startsWith('http://localhost:') || 
        origin?.startsWith('http://127.0.0.1:') ||
        origin?.startsWith('https://localhost:') || 
        origin?.startsWith('https://127.0.0.1:') ||
        origin?.endsWith('.vercel.app') ||
        origin?.endsWith('.netlify.app') ||
        origin?.endsWith('.amplifyapp.com') ||
        origin?.endsWith('.web.app')) { // Allow all Firebase Hosting domains
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit to 500 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Specific rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 OTP requests per minute
  message: 'Too many OTP requests, please try again later.',
});

app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/resend-otp', otpLimiter);

// Specific rate limit for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/google', googleRoutes);
if (useAuth0) {
  app.use('/api/auth0', require('./routes/auth0.routes'));
}
app.use('/api/courses', courseRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/quizzes', quizRoutes);
app.use('/api/code-lab', codeLabRoutes);
app.use('/api/rss', rssRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Simple test endpoint to verify deployment
app.get('/test-deployment', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Deployment test endpoint working',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aarambh LMS API Server',
    version: '1.0.0',
    auth0Enabled: useAuth0,
    endpoints: {
      health: '/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      verifyOTPDB: 'POST /api/auth/verify-otp-db',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me',
      sendOTP: 'POST /api/auth/send-otp',
      verifyOTP: 'POST /api/auth/verify-otp',
      resendOTP: 'POST /api/auth/resend-otp',
      sendWelcome: 'POST /api/auth/send-welcome',
      firebaseCallback: 'POST /api/auth/firebase/callback',
      googleLogin: 'GET /api/google/auth/google',
      googleCallback: 'GET /api/google/auth/google/callback',
    },
  });
});

// Diagnostic endpoint to check route registration
app.get('/diagnostics/routes', (req, res) => {
  // Function to extract all routes
  function getRoutes(stack, prefix = '') {
    const routes = [];
    
    stack.forEach(layer => {
      if (layer.route) {
        // This is a route
        const path = prefix + layer.route.path;
        Object.keys(layer.route.methods).forEach(method => {
          routes.push({
            method: method.toUpperCase(),
            path: path
          });
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // This is a sub-router
        const subPrefix = prefix + (layer.mountPath || '');
        routes.push(...getRoutes(layer.handle.stack, subPrefix));
      }
    });
    
    return routes;
  }

  // Extract all routes
  const authRoutesList = getRoutes(authRoutes.stack, '/api/auth');
  const googleRoutesList = getRoutes(googleRoutes.stack, '/api/google');

  res.json({
    success: true,
    message: 'Route diagnostics',
    authRoutes: authRoutesList,
    googleRoutes: googleRoutesList,
    firebaseCallbackRoute: authRoutesList.find(route => 
      route.path === '/api/auth/firebase/callback' && route.method === 'POST'
    )
  });
});

// Diagnostic endpoint to check Firebase environment variables
app.get('/diagnostics/firebase-env', (req, res) => {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  const envStatus = {};
  let allPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    const isPresent = !!process.env[envVar];
    envStatus[envVar] = {
      present: isPresent,
      value: isPresent ? '[REDACTED]' : null
    };
    
    if (!isPresent) {
      allPresent = false;
    }
  });
  
  res.status(200).json({
    success: true,
    message: 'Firebase environment check',
    allVariablesPresent: allPresent,
    environmentVariables: envStatus
  });
});

// Comprehensive diagnostic endpoint
app.get('/diagnostics/comprehensive', async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      serverStatus: 'running',
      routes: {}
    };
    
    // Check environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL', 
      'FIREBASE_PRIVATE_KEY',
      'MONGODB_URI',
      'JWT_SECRET'
    ];
    
    diagnostics.environmentVariables = {};
    let allEnvVarsPresent = true;
    requiredEnvVars.forEach(envVar => {
      const isPresent = !!process.env[envVar];
      diagnostics.environmentVariables[envVar] = isPresent ? '✅ Present' : '❌ Missing';
      if (!isPresent) allEnvVarsPresent = false;
    });
    
    // Check Firebase Admin SDK
    try {
      const admin = require('firebase-admin');
      diagnostics.firebaseAdminSDK = '✅ Available';
      
      if (!admin.apps.length) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
          });
          diagnostics.firebaseInitialization = '✅ Initialized successfully';
        } catch (initError) {
          diagnostics.firebaseInitialization = `❌ Initialization failed: ${initError.message}`;
        }
      } else {
        diagnostics.firebaseInitialization = '✅ Already initialized';
      }
    } catch (error) {
      diagnostics.firebaseAdminSDK = `❌ Not available: ${error.message}`;
    }
    
    // Check database connection
    try {
      const mongoose = require('mongoose');
      diagnostics.databaseConnection = mongoose.connection.readyState === 1 ? '✅ Connected' : '⚠️ Not connected';
    } catch (error) {
      diagnostics.databaseConnection = `❌ Error: ${error.message}`;
    }
    
    // Check route registration
    try {
      // Function to extract all routes
      function getRoutes(stack, prefix = '') {
        const routes = [];
        
        stack.forEach(layer => {
          if (layer.route) {
            // This is a route
            const path = prefix + layer.route.path;
            Object.keys(layer.route.methods).forEach(method => {
              routes.push({
                method: method.toUpperCase(),
                path: path
              });
            });
          } else if (layer.name === 'router' && layer.handle.stack) {
            // This is a sub-router
            const subPrefix = prefix + (layer.mountPath || '');
            routes.push(...getRoutes(layer.handle.stack, subPrefix));
          }
        });
        
        return routes;
      }

      // Extract all routes
      const authRoutesList = getRoutes(authRoutes.stack, '/api/auth');
      const googleRoutesList = getRoutes(googleRoutes.stack, '/api/google');
      
      diagnostics.routes.auth = authRoutesList.length;
      diagnostics.routes.google = googleRoutesList.length;
      
      // Check specifically for Firebase callback route
      const firebaseCallbackRoute = authRoutesList.find(route => 
        route.path === '/api/auth/firebase/callback' && route.method === 'POST'
      );
      
      diagnostics.routes.firebaseCallback = firebaseCallbackRoute ? '✅ Registered' : '❌ Not registered';
      
    } catch (error) {
      diagnostics.routes.error = error.message;
    }
    
    res.status(200).json({
      success: true,
      message: 'Comprehensive diagnostics completed',
      diagnostics: diagnostics
    });
    
  } catch (error) {
    console.error('Diagnostics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running diagnostics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum file size is 10MB.',
      });
    }
  }
  
  // Handle Auth0 errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Add startup logging
console.log('🔄 Server process starting...');
console.log('Environment variables check:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || 'not set');

// Log when the process exits
process.on('exit', (code) => {
  console.log(`🔄 Server process exiting with code: ${code}`);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  console.error('Error stack:', error.stack);
});

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🚀 Aarambh LMS Backend Server Started`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🚀 WebSocket server available at: ws://localhost:${PORT}`);
  console.log(`🚀 Health check: /health`);
  console.log(`🚀 Auth0 Integration: ${useAuth0 ? 'Enabled' : 'Disabled'}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📧 Email Service: Gmail');
  console.log(`📧 From: ${process.env.GMAIL_USER}`);
  console.log('');
  console.log('📌 Available Endpoints:');
  console.log('   Authentication:');
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   POST /api/auth/verify-otp-db - Verify OTP (MongoDB)`);
  console.log(`   POST /api/auth/logout - Logout user`);
  console.log(`   GET  /api/auth/me - Get current user`);
  console.log('');
  console.log('   Google OAuth:');
  console.log(`   GET /api/google/auth/google - Initiate Google OAuth`);
  console.log(`   GET /api/google/auth/google/callback - Google OAuth callback`);
  console.log('');
  console.log('   Legacy OTP (Email-based):');
  console.log(`   POST /api/auth/send-otp`);
  console.log(`   POST /api/auth/verify-otp`);
  console.log(`   POST /api/auth/resend-otp`);
  console.log(`   POST /api/auth/send-welcome`);
  console.log('');
  console.log('✨ Ready to send OTP emails!');
  console.log('');
  
  // Log route registration status
  console.log('✅ Server startup completed successfully');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  }
});

module.exports = app;