/**
 * OTP Service - Handles OTP generation, storage, and validation
 */

// In-memory storage for OTPs (use Redis or Database in production)
const otpStore = new Map();

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

/**
 * Store OTP with expiration
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP
 * @param {number} expiryMinutes - Expiry time in minutes
 */
const storeOTP = (email, otp, expiryMinutes = 10) => {
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
  
  otpStore.set(email, {
    otp,
    expiryTime,
    attempts: 0,
    createdAt: Date.now(),
  });
  
  console.log(`📝 OTP stored for ${email}: ${otp} (expires in ${expiryMinutes} minutes)`);
};

/**
 * Verify OTP
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {object} Verification result
 */
const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return {
      success: false,
      message: 'OTP not found. Please request a new one.',
    };
  }
  
  // Check if OTP expired
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }
  
  // Increment attempts
  stored.attempts += 1;
  
  // Check max attempts
  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
  if (stored.attempts > maxAttempts) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    };
  }
  
  // Verify OTP
  if (stored.otp === otp) {
    otpStore.delete(email); // Remove OTP after successful verification
    return {
      success: true,
      message: 'OTP verified successfully!',
    };
  }
  
  return {
    success: false,
    message: `Invalid OTP. ${maxAttempts - stored.attempts} attempts remaining.`,
    attemptsRemaining: maxAttempts - stored.attempts,
  };
};

/**
 * Check if OTP exists and is valid
 * @param {string} email - User's email
 * @returns {boolean}
 */
const hasValidOTP = (email) => {
  const stored = otpStore.get(email);
  
  if (!stored) return false;
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(email);
    return false;
  }
  
  return true;
};

/**
 * Get OTP info (for debugging - remove in production)
 * @param {string} email - User's email
 * @returns {object|null}
 */
const getOTPInfo = (email) => {
  const stored = otpStore.get(email);
  
  if (!stored) return null;
  
  return {
    exists: true,
    expiresIn: Math.max(0, Math.floor((stored.expiryTime - Date.now()) / 1000)),
    attempts: stored.attempts,
  };
};

/**
 * Clean up expired OTPs (run periodically)
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(email);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  hasValidOTP,
  getOTPInfo,
  cleanupExpiredOTPs,
};
