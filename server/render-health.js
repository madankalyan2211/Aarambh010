// Render-specific health check endpoint
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aarambh LMS API Server',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: process.env.RENDER ? 'Render' : 'Local',
    port: process.env.PORT || 3001,
  });
});

app.get('/health', (req, res) => {
  const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongodbStatus,
    uptime: process.uptime(),
    platform: process.env.RENDER ? 'Render' : 'Local',
    port: process.env.PORT || 3001,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Render health check server running on port ${PORT}`);
});