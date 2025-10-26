const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Create and configure email transporter using Gmail
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });

  return transporter;
};

/**
 * Email templates
 */
const emailTemplates = {
  otpEmail: (otp, userName = 'User') => ({
    subject: 'Your Aarambh LMS Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
          }
          .otp-box {
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .content {
            text-align: center;
            color: #555;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Aarambh</div>
            <p style="color: #666; margin: 0;">Your AI-Powered Learning Companion</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hello ${userName},</p>
            <p>Your verification code for Aarambh LMS is:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p>This code will expire in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
              Aarambh team will never ask for your verification code.
            </div>
            
            <p style="color: #888; font-size: 14px;">
              If you didn't request this code, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Aarambh LMS. All rights reserved.</p>
            <p>Learn. Connect. Grow.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

Your verification code for Aarambh LMS is: ${otp}

This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.

If you didn't request this code, please ignore this email.

Best regards,
Aarambh LMS Team
    `,
  }),
};

module.exports = { createTransporter, emailTemplates };
