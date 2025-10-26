# 🚀 Aarambh LMS Backend API Server

Backend API server for handling email OTP verification using Gmail and Nodemailer.

---

## 📋 Features

✅ **Email OTP Service** - Send verification codes via Gmail  
✅ **OTP Management** - Generate, store, and verify OTPs  
✅ **Rate Limiting** - Prevent abuse with request throttling  
✅ **CORS Support** - Secure cross-origin requests  
✅ **Beautiful Email Templates** - Professional HTML emails  
✅ **Error Handling** - Comprehensive error responses  
✅ **Welcome Emails** - Post-registration emails  
✅ **Firebase Authentication** - Google sign-in and email/password authentication  

---

## 🏗️ Project Structure

```
server/
├── config/
│   └── email.config.js      # Email transporter & templates
├── services/
│   ├── otp.service.js       # OTP generation & validation
│   └── email.service.js     # Email sending logic
├── routes/
│   └── auth.routes.js       # API endpoints
├── .env                      # Environment variables
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

---

## ⚙️ Installation

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `nodemailer` - Email sending
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `express-rate-limit` - Rate limiting
- `nodemon` - Auto-restart (dev)

---

## 🔐 Configuration

The `.env` file is already configured with your Gmail credentials:

```env
# Server
PORT=3001
NODE_ENV=development

# Gmail
GMAIL_USER=teamaarambh01@gmail.com
GMAIL_APP_PASSWORD=rkzcbqxiuckobrlo
GMAIL_FROM_NAME=Aarambh LMS

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Firebase Admin SDK (for Firebase Authentication)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-client-email
# FIREBASE_PRIVATE_KEY=your-private-key
```

For Firebase authentication setup, see [FIREBASE_AUTH_SETUP.md](../FIREBASE_AUTH_SETUP.md)

---

## 🔐 Firebase Security Best Practices

### Environment Variable Management

Never commit Firebase credentials to version control. The `.gitignore` file is configured to exclude `.env` files, but always verify:

```bash
# Check that .env is ignored
git check-ignore -v .env
```

### Validating Firebase Configuration

Use the provided validation script to ensure all required Firebase variables are present:

```bash
node validate-firebase-config.js
```

### Firebase Admin SDK Configuration

For production deployments, set these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_TYPE` | Service account type | `service_account` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `aarambh-01` |
| `FIREBASE_PRIVATE_KEY_ID` | Private key ID | `44e5ef911b33454c9a7aacb396995b6cd20cf4d6` |
| `FIREBASE_PRIVATE_KEY` | Private key (escaped newlines) | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |
| `FIREBASE_CLIENT_EMAIL` | Client email | `firebase-adminsdk-fbsvc@aarambh-01.iam.gserviceaccount.com` |
| `FIREBASE_CLIENT_ID` | Client ID | `118163337654653645955` |
| `FIREBASE_AUTH_URI` | Auth URI | `https://accounts.google.com/o/oauth2/auth` |
| `FIREBASE_TOKEN_URI` | Token URI | `https://oauth2.googleapis.com/token` |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Auth provider cert URL | `https://www.googleapis.com/oauth2/v1/certs` |
| `FIREBASE_CLIENT_X509_CERT_URL` | Client cert URL | `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aarambh-01.iam.gserviceaccount.com` |
| `FIREBASE_UNIVERSE_DOMAIN` | Universe domain | `googleapis.com` |

For detailed security guidelines, see [FIREBASE_SECURITY_GUIDE.md](../FIREBASE_SECURITY_GUIDE.md)

---

## 🚀 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

You should see:

```
🚀 ========================================
🚀 Aarambh LMS Backend Server Started
🚀 Environment: development
🚀 Server running on: http://localhost:3001
🚀 ========================================

📧 Email Service: Gmail
📧 From: teamaarambh01@gmail.com

✅ Email server is ready to send messages
✨ Ready to send OTP emails!
```

---

## ☁️ Deployment to Render

### Quick Deployment

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your repository
4. Configure environment variables (see below)
5. Deploy!

### Environment Variables for Render

You must set these environment variables in your Render dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key` |
| `GMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `ALLOWED_ORIGINS` | Frontend URLs | `https://your-frontend.onrender.com` |
| `API_SECRET_KEY` | API secret key | `your-api-secret-key` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `aarambh-01` |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | `firebase-adminsdk-fbsvc@aarambh-01.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

### MongoDB Atlas Configuration

For Render deployment, add `0.0.0.0/0` to your MongoDB Atlas IP whitelist for testing, or use static IPs for production.

### Deployment Guides

For detailed deployment instructions, see:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete deployment guide
- [RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [RENDER_DEPLOYMENT_SUMMARY.md](RENDER_DEPLOYMENT_SUMMARY.md) - Quick reference

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### 1. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com",
  "expiresIn": 600
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

---

### 3. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "email": "user@example.com",
  "expiresIn": 600
}
```

---

### 4. Send Welcome Email

**Endpoint:** `POST /api/auth/send-welcome`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

---

### 5. Firebase Authentication Callback

**Endpoint:** `POST /api/auth/firebase/callback`

**Request Body:**
```json
{
  "idToken": "firebase-id-token",
  "name": "John Doe",
  "email": "user@example.com",
  "uid": "firebase-user-uid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Firebase authentication successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

---

### 6. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🧪 Testing with cURL

### Send OTP
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Firebase Authentication Callback
```bash
curl -X POST http://localhost:3001/api/auth/firebase/callback \
  -H "Content-Type: application/json" \
  -d '{"idToken":"firebase-id-token","name":"John Doe","email":"user@example.com","uid":"firebase-user-uid"}'
```

---

## 🛡️ Security Features

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **OTP Endpoints**: 5 requests per minute

### CORS Protection

Only allowed origins can access the API:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

### OTP Security

- ✅ 6-digit random OTP
- ✅ 10-minute expiration
- ✅ Maximum 3 verification attempts
- ✅ Automatic cleanup of expired OTPs

---

## 📧 Email Template

The OTP email includes:

- **Beautiful HTML design** with gradient branding
- **Large, clear OTP display**
- **Expiration time notice**
- **Security warning**
- **Professional footer**

---

## 🔧 Troubleshooting

### Error: "Email transporter verification failed"

**Solution:**
- Check Gmail credentials in `.env`
- Ensure App Password is correct (16 characters, no spaces)
- Verify 2-Step Verification is enabled

---

### Error: "ECONNREFUSED"

**Solution:**
- Check if port 3001 is available
- Stop any other process using port 3001
- Or change PORT in `.env`

---

### Error: "Invalid credentials"

**Solution:**
- Regenerate Gmail App Password
- Update `GMAIL_APP_PASSWORD` in `.env`
- Restart the server

---

### OTP Not Received

**Check:**
1. Email sent successfully (check server logs)
2. Check spam/junk folder
3. Verify Gmail account has sending enabled
4. Check Gmail sent folder

---

## 📊 Monitoring

### Server Logs

The server provides detailed logging:

```
✅ Email sent successfully! Message ID: <xxx@gmail.com>
📝 OTP stored for user@example.com: 123456 (expires in 10 minutes)
🧹 Cleaned up 3 expired OTPs
```

### Error Logs

```
❌ Email transporter verification failed: ...
❌ Error sending email: ...
```

---

## 🚀 Production Deployment

### Recommendations

1. **Use Environment Variables**
   - Store secrets in secure environment variables
   - Never commit `.env` to version control

2. **Use a Database**
   - Replace in-memory OTP storage with Redis/MongoDB
   - Add user session management

3. **Enable HTTPS**
   - Use SSL certificates
   - Update CORS origins

4. **Add Authentication**
   - Implement JWT tokens
   - Add API key authentication

5. **Use Professional Email Service**
   - Consider SendGrid, AWS SES, or Mailgun
   - Better deliverability and analytics

6. **Add Logging**
   - Use Winston or Pino for structured logging
   - Monitor with services like DataDog or New Relic

---

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `GMAIL_USER` | Gmail address | - |
| `GMAIL_APP_PASSWORD` | Gmail app password | - |
| `GMAIL_FROM_NAME` | Sender name | Aarambh LMS |
| `SMTP_HOST` | SMTP server | smtp.gmail.com |
| `SMTP_PORT` | SMTP port | 587 |
| `OTP_EXPIRY_MINUTES` | OTP validity | 10 |
| `OTP_LENGTH` | OTP digits | 6 |
| `OTP_MAX_ATTEMPTS` | Max verify attempts | 3 |
| `ALLOWED_ORIGINS` | CORS origins | localhost:5173 |

---

## 🆘 Support

If you encounter issues:

1. Check server logs for error messages
2. Verify all environment variables are set
3. Test with cURL to isolate frontend/backend issues
4. Check Gmail account status and quotas

---

**Built with ❤️ for Aarambh LMS**