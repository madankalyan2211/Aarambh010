# Environment Variables Setup Guide

This guide will help you set up environment variables for the Aarambh LMS application, particularly for email OTP functionality.

## 📋 Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values in `.env`**

3. **Never commit `.env` to version control** (it's already in `.gitignore`)

---

## 🔑 Environment Variables Reference

### Email Service Configuration

You can choose one of the following email service providers:

#### Option 1: Resend (Recommended for Simplicity)
```env
VITE_EMAIL_SERVICE_PROVIDER=resend
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_RESEND_FROM_EMAIL=noreply@aarambh.com
```

**Setup Steps:**
1. Go to [resend.com](https://resend.com)
2. Create a free account
3. Generate an API key
4. Verify your domain or use their test domain

#### Option 2: SendGrid
```env
VITE_EMAIL_SERVICE_PROVIDER=sendgrid
VITE_SENDGRID_API_KEY=SG.your_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@aarambh.com
VITE_SENDGRID_FROM_NAME=Aarambh LMS
```

**Setup Steps:**
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create a free account (100 emails/day free tier)
3. Create an API key in Settings > API Keys
4. Verify your sender email

#### Option 3: AWS SES
```env
VITE_EMAIL_SERVICE_PROVIDER=aws-ses
VITE_AWS_SES_REGION=us-east-1
VITE_AWS_SES_ACCESS_KEY_ID=your_access_key
VITE_AWS_SES_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_SES_FROM_EMAIL=noreply@aarambh.com
```

**Setup Steps:**
1. Log in to AWS Console
2. Navigate to SES (Simple Email Service)
3. Verify your email or domain
4. Create IAM credentials with SES permissions

---

## 🔐 OTP Configuration

```env
# How long the OTP is valid (in minutes)
VITE_OTP_EXPIRY_MINUTES=10

# Length of OTP code
VITE_OTP_LENGTH=6

# Maximum times user can resend OTP
VITE_OTP_MAX_RESEND_ATTEMPTS=3

# Cooldown period between resends (in seconds)
VITE_OTP_RESEND_COOLDOWN=60
```

---

## 🌐 Backend API Configuration

```env
# Your backend API endpoint
VITE_API_BASE_URL=http://localhost:3000/api

# API request timeout (in milliseconds)
VITE_API_TIMEOUT=30000
```

---

## 🎯 Application Configuration

```env
# Environment: development, staging, or production
VITE_APP_ENV=development

# Enable debug logging
VITE_DEBUG_MODE=true

# Application URL
VITE_APP_URL=http://localhost:5173
```

---

## 🛡️ Security Configuration

```env
# Secret key for JWT tokens
VITE_JWT_SECRET=your_super_secret_jwt_key_here

# Session timeout in minutes
VITE_SESSION_TIMEOUT=30
```

---

## 🚀 Feature Flags

Control which features are enabled:

```env
# Enable/disable email verification with OTP
VITE_ENABLE_EMAIL_VERIFICATION=true

# Enable/disable social login (Google, etc.)
VITE_ENABLE_SOCIAL_LOGIN=false

# Enable/disable two-factor authentication
VITE_ENABLE_2FA=true
```

---

## 📝 Usage in Code

Import and use environment variables in your components:

```typescript
import { env } from '../config/env';

// Access environment variables
const apiKey = env.resendApiKey;
const otpLength = env.otpLength;
const isEmailVerificationEnabled = env.enableEmailVerification;
```

---

## 🔍 Validation

The `env.ts` utility includes validation to check if required variables are set:

```typescript
import { validateEnv } from '../config/env';

const validation = validateEnv();
if (!validation.valid) {
  console.error('Missing required environment variables:', validation.missing);
}
```

---

## ⚠️ Important Notes

### Security Best Practices

1. **Never commit `.env` to Git**
   - The `.gitignore` file already excludes it
   - Only commit `.env.example` as a template

2. **Use different values for each environment**
   - Development: `.env.development`
   - Staging: `.env.staging`
   - Production: `.env.production`

3. **Rotate API keys regularly**
   - Change keys periodically
   - Immediately rotate if compromised

4. **Limit API key permissions**
   - Only grant necessary permissions
   - Use separate keys for different environments

### Vite Environment Variables

- All variables must start with `VITE_` to be exposed to the client
- Variables are embedded at build time
- Never store sensitive secrets in client-side code
- Use a backend API for sensitive operations

---

## 🧪 Testing in Development

For local development and testing, you can use test mode:

1. **Resend Test Mode:**
   - Use their test API key
   - Emails won't actually send but will be logged

2. **SendGrid Test Mode:**
   - Use sandbox mode
   - Check email in SendGrid dashboard

3. **Console Logging:**
   - OTP is currently logged to console for demo
   - Check browser console for the OTP code

---

## 📧 Email Service Comparison

| Provider | Free Tier | Ease of Setup | Best For |
|----------|-----------|---------------|----------|
| **Resend** | 3,000/month | ⭐⭐⭐⭐⭐ Easy | Modern apps, quick setup |
| **SendGrid** | 100/day | ⭐⭐⭐⭐ Moderate | Established apps |
| **AWS SES** | 62,000/month | ⭐⭐⭐ Complex | AWS ecosystem |

---

## 🐛 Troubleshooting

### OTP Not Sending
1. Check API key is correct
2. Verify email address is verified with provider
3. Check console for error messages
4. Verify environment variables are loaded

### Environment Variables Not Working
1. Restart the development server after changing `.env`
2. Ensure variables start with `VITE_`
3. Check for typos in variable names
4. Verify `.env` file is in the root directory

---

## 📚 Additional Resources

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid API Docs](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all required environment variables are set
3. Ensure API keys have proper permissions
4. Test with a simple email first

---

**Created for Aarambh LMS** 🎓
