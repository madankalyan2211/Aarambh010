// Health check endpoint for Render
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.get('/health', (req, res) => {
  const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongodbStatus,
    uptime: process.uptime(),
  });
});

module.exports = app;