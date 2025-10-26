/**
 * Environment Configuration Utility
 * This file provides type-safe access to environment variables
 */

interface EnvConfig {
  // Email Service
  emailServiceProvider: string;
  
  // Gmail Configuration
  gmailUser: string;
  gmailAppPassword: string;
  gmailFromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  
  // SendGrid
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
  
  // AWS SES
  awsSesRegion: string;
  awsSesAccessKeyId: string;
  awsSesSecretAccessKey: string;
  awsSesFromEmail: string;
  
  // Resend
  resendApiKey: string;
  resendFromEmail: string;
  
  // OTP Configuration
  otpExpiryMinutes: number;
  otpLength: number;
  otpMaxResendAttempts: number;
  otpResendCooldown: number;
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Application
  appEnv: 'development' | 'staging' | 'production';
  debugMode: boolean;
  appUrl: string;
  
  // Security
  jwtSecret: string;
  sessionTimeout: number;
  
  // Third-party
  googleClientId: string;
  googleClientSecret: string;
  googleAnalyticsId: string;
  
  // Feature Flags
  enableEmailVerification: boolean;
  enableSocialLogin: boolean;
  enable2FA: boolean;
  
  // Auth0 Configuration
  auth0Domain: string;
  auth0ClientId: string;
  auth0Audience: string;
}

/**
 * Get environment variable with fallback
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env[key] || defaultValue;
};

/**
 * Get boolean environment variable
 */
const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = (import.meta as any).env[key];
  if (value === undefined || value === null) return defaultValue;
  return value === 'true' || value === true;
};

/**
 * Get number environment variable
 */
const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = (import.meta as any).env[key];
  if (value === undefined || value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  // Email Service
  emailServiceProvider: getEnv('VITE_EMAIL_SERVICE_PROVIDER', 'gmail'),
  
  // Gmail Configuration
  gmailUser: getEnv('VITE_GMAIL_USER'),
  gmailAppPassword: getEnv('VITE_GMAIL_APP_PASSWORD'),
  gmailFromName: getEnv('VITE_GMAIL_FROM_NAME', 'Aarambh LMS'),
  smtpHost: getEnv('VITE_SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: getEnvNumber('VITE_SMTP_PORT', 587),
  smtpSecure: getEnvBoolean('VITE_SMTP_SECURE', false),
  
  // SendGrid
  sendgridApiKey: getEnv('VITE_SENDGRID_API_KEY'),
  sendgridFromEmail: getEnv('VITE_SENDGRID_FROM_EMAIL', 'noreply@aarambh.com'),
  sendgridFromName: getEnv('VITE_SENDGRID_FROM_NAME', 'Aarambh LMS'),
  
  // AWS SES
  awsSesRegion: getEnv('VITE_AWS_SES_REGION', 'us-east-1'),
  awsSesAccessKeyId: getEnv('VITE_AWS_SES_ACCESS_KEY_ID'),
  awsSesSecretAccessKey: getEnv('VITE_AWS_SES_SECRET_ACCESS_KEY'),
  awsSesFromEmail: getEnv('VITE_AWS_SES_FROM_EMAIL'),
  
  // Resend
  resendApiKey: getEnv('VITE_RESEND_API_KEY'),
  resendFromEmail: getEnv('VITE_RESEND_FROM_EMAIL', 'noreply@aarambh.com'),
  
  // OTP Configuration
  otpExpiryMinutes: getEnvNumber('VITE_OTP_EXPIRY_MINUTES', 10),
  otpLength: getEnvNumber('VITE_OTP_LENGTH', 6),
  otpMaxResendAttempts: getEnvNumber('VITE_OTP_MAX_RESEND_ATTEMPTS', 3),
  otpResendCooldown: getEnvNumber('VITE_OTP_RESEND_COOLDOWN', 60),
  
  // API Configuration
  apiBaseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:3002/api'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
  
  // Application
  appEnv: getEnv('VITE_APP_ENV', 'development') as EnvConfig['appEnv'],
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', false),
  appUrl: getEnv('VITE_APP_URL', 'http://localhost:5174'),
  
  // Security
  jwtSecret: getEnv('VITE_JWT_SECRET'),
  sessionTimeout: getEnvNumber('VITE_SESSION_TIMEOUT', 30),
  
  // Third-party
  googleClientId: getEnv('VITE_GOOGLE_CLIENT_ID'),
  googleClientSecret: getEnv('VITE_GOOGLE_CLIENT_SECRET'),
  googleAnalyticsId: getEnv('VITE_GOOGLE_ANALYTICS_ID'),
  
  // Feature Flags
  enableEmailVerification: getEnvBoolean('VITE_ENABLE_EMAIL_VERIFICATION', true),
  enableSocialLogin: getEnvBoolean('VITE_ENABLE_SOCIAL_LOGIN', false),
  enable2FA: getEnvBoolean('VITE_ENABLE_2FA', true),
  
  // Auth0 Configuration (disabled)
  auth0Domain: '',
  auth0ClientId: '',
  auth0Audience: '',
};

/**
 * Validate required environment variables
 */
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const required: string[] = [];
  
  if (env.enableEmailVerification) {
    switch (env.emailServiceProvider) {
      case 'gmail':
        if (!env.gmailUser) required.push('VITE_GMAIL_USER');
        if (!env.gmailAppPassword) required.push('VITE_GMAIL_APP_PASSWORD');
        break;
      case 'sendgrid':
        if (!env.sendgridApiKey) required.push('VITE_SENDGRID_API_KEY');
        break;
      case 'aws-ses':
        if (!env.awsSesAccessKeyId) required.push('VITE_AWS_SES_ACCESS_KEY_ID');
        if (!env.awsSesSecretAccessKey) required.push('VITE_AWS_SES_SECRET_ACCESS_KEY');
        break;
      case 'resend':
        if (!env.resendApiKey) required.push('VITE_RESEND_API_KEY');
        break;
    }
  }
  
  return {
    valid: required.length === 0,
    missing: required,
  };
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return env.appEnv === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return env.appEnv === 'production';
};

/**
 * Log environment configuration (for debugging)
 */
export const logEnvConfig = (): void => {
  if (env.debugMode) {
    // Debug logs are only shown when debug mode is enabled
  }
};