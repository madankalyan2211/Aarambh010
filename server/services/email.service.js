const { createTransporter, emailTemplates } = require('../config/email.config.js');

const transporter = createTransporter();

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<object>} Send result
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  // Always log OTP to console for development/testing
  console.log('\n' + '='.repeat(60));
  console.log('🔐 OTP VERIFICATION CODE');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${userName}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
  console.log('='.repeat(60) + '\n');
  
  // Skip email sending if credentials not configured (common on Render free tier)
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️  Email credentials not configured. OTP displayed in console only.');
    return {
      success: true,
      message: 'OTP generated (email not sent - check console)',
      consoleOnly: true
    };
  }
  
  try {
    const { subject, html, text } = emailTemplates.otpEmail(otp, userName);
    
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'Aarambh LMS'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
      text,
    };
    
    console.log(`📧 Attempting to send OTP email to ${email}...`);
    
    // Set timeout to 10 seconds to avoid long waits on Render
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout after 10s')), 10000)
      )
    ]);
    
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP sent to email',
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log('⚠️  Email failed, but OTP is available in console above');
    
    // Return success anyway since OTP is in console
    return {
      success: true,
      error: error.message,
      message: 'OTP generated (email failed - check console)',
      consoleOnly: true
    };
  }
};

/**
 * Send welcome email (optional - for after successful registration)
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<object>} Send result
 */
const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'Aarambh LMS'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Aarambh LMS! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Aarambh! 🎓</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for joining Aarambh LMS! We're excited to have you on board.</p>
              <p>You're now part of a community dedicated to learning, growth, and success.</p>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Explore your personalized dashboard</li>
                <li>Join discussions and connect with peers</li>
                <li>Start your first course</li>
                <li>Track your progress and achievements</li>
              </ul>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy learning! 🚀</p>
              <p>Best regards,<br>The Aarambh Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Aarambh LMS, ${userName}! We're excited to have you on board. Start exploring your dashboard and begin your learning journey today!`,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};
