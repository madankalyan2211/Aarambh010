# 🚀 Quick Start Guide - Aarambh LMS with Email OTP

Complete guide to get your Aarambh LMS running with real email OTP verification.

---

## 📋 Prerequisites

- ✅ Node.js installed (v16 or higher)
- ✅ Gmail account with App Password setup
- ✅ Two terminal windows/tabs

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Frontend Dependencies

```bash
# In the project root directory
npm install
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Go back to root
cd ..
```

### Step 3: Run Both Servers

**Terminal 1 - Backend API** (Run this FIRST)
```bash
cd server
npm run dev
```

Wait for:
```
✅ Email server is ready to send messages
✨ Ready to send OTP emails!
```

**Terminal 2 - Frontend App**
```bash
# From project root
npm run dev
```

---

## 🌐 Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3001
3. **Health Check**: http://localhost:3001/health

---

## 🧪 Testing the OTP Flow

### Test Registration with OTP

1. Open http://localhost:5173
2. Click "Sign up" (or toggle to registration)
3. Fill in the form:
   - **Role**: Select Student/Teacher/Admin
   - **Name**: Your name
   - **Email**: Any valid email address
   - **Password**: Create a password

4. Click **"Create Account"**

5. **OTP Verification Screen appears**
   - Check your email for the OTP code
   - Enter the 6-digit code
   - Click "Verify OTP"

6. **Success!** → Welcome tour → Dashboard

### Test Login with OTP

1. Click "Sign in"
2. Fill in:
   - **Role**: Select role
   - **Email**: Your email
   - **Password**: Your password

3. Click **"Sign In"**

4. **OTP Verification**
   - Check email for OTP
   - Enter code
   - Verify

5. **Success!** → Dashboard

---

## 📧 Email Preview

You'll receive a professional email like this:

```
Subject: Your Aarambh LMS Verification Code

┌─────────────────────────────────┐
│          Aarambh                │
│  Your AI-Powered Learning       │
│        Companion                │
└─────────────────────────────────┘

Hello [Your Name],

Your verification code for Aarambh LMS is:

    ┌───────────┐
    │  123456   │
    └───────────┘

This code will expire in 10 minutes.

⚠️ Security Notice: Never share this code 
with anyone.

© 2024 Aarambh LMS
Learn. Connect. Grow.
```

---

## 🔍 Troubleshooting

### Problem: Backend won't start

**Check:**
```bash
# Make sure you're in the server directory
cd server

# Try installing dependencies again
npm install

# Run with logs
npm run dev
```

---

### Problem: OTP not sending

**Solutions:**

1. **Check Backend Logs**
   - Look for "✅ Email sent successfully"
   - Or "❌ Error sending email"

2. **Verify Gmail Setup**
   - Check `server/.env` has correct credentials
   - Gmail: `teamaarambh01@gmail.com`
   - App Password: `rkzcbqxiuckobrlo`

3. **Restart Backend**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

---

### Problem: "Network error" or "Failed to fetch"

**Solution:**

1. **Ensure Backend is Running**
   - Check Terminal 1 shows server running
   - Visit http://localhost:3001/health
   - Should return: `{"success":true,"message":"Server is running"}`

2. **Check Ports**
   - Backend: Port 3001
   - Frontend: Port 5173

3. **Check `.env` files**
   - Root `.env`: `VITE_API_BASE_URL=http://localhost:3001/api`
   - Server `.env`: `PORT=3001`

---

### Problem: Email goes to spam

**Solutions:**
- Add `teamaarambh01@gmail.com` to contacts
- Mark as "Not Spam" in Gmail
- This is normal for development testing

---

### Problem: Can't verify OTP

**Check:**
1. OTP entered correctly (6 digits)
2. OTP not expired (10 minutes)
3. Backend server is running
4. Check backend logs for verification attempts

---

## 💡 Development Tips

### View Backend Logs

Backend shows helpful information:
```
📧 Sending OTP email to user@example.com...
✅ Email sent successfully! Message ID: xxx
📝 OTP stored for user@example.com: 123456
```

### Test API Directly

Use cURL or Postman:

```bash
# Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test"}'

# Verify OTP
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Check Email Service Status

```bash
curl http://localhost:3001/health
```

---

## 📊 What's Happening Behind the Scenes

1. **User Submits Form** → Frontend validates input
2. **Frontend Calls API** → `POST /api/auth/send-otp`
3. **Backend Generates OTP** → Random 6-digit code
4. **Backend Stores OTP** → In-memory with 10-min expiry
5. **Backend Sends Email** → Via Gmail SMTP
6. **User Receives Email** → Beautiful HTML template
7. **User Enters OTP** → Frontend validates length
8. **Frontend Verifies** → `POST /api/auth/verify-otp`
9. **Backend Checks** → OTP match, expiry, attempts
10. **Success** → User proceeds to dashboard

---

## 🎨 Features Included

### Frontend
- ✅ Multi-step OTP verification UI
- ✅ Countdown timer for resend
- ✅ Error handling with user feedback
- ✅ Loading states
- ✅ Beautiful animations
- ✅ Responsive design

### Backend
- ✅ Gmail integration with Nodemailer
- ✅ OTP generation & storage
- ✅ Email templates (HTML + Text)
- ✅ Rate limiting (5 OTP/min)
- ✅ CORS protection
- ✅ Automatic OTP cleanup
- ✅ Comprehensive error handling

---

## 🔐 Security Features

- **App Passwords** - Not using actual Gmail password
- **Rate Limiting** - Prevents spam/abuse
- **OTP Expiry** - 10-minute validity
- **Max Attempts** - 3 verification tries
- **CORS** - Only allowed origins
- **Input Validation** - Email format, OTP length

---

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## 🚀 Next Steps

1. **Test the full flow** - Registration → OTP → Dashboard
2. **Check spam folder** - OTP emails might go there initially
3. **Try resend functionality** - Wait 60 seconds, click "Resend OTP"
4. **Test error cases** - Wrong OTP, expired OTP, etc.

---

## 📚 Documentation

- **Backend API**: See `server/README.md`
- **Environment Setup**: See `ENV_SETUP.md`
- **Project Structure**: See main `README.md`

---

## 🆘 Still Having Issues?

### Check These Files:

1. **`.env`** (root) - Frontend config
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. **`server/.env`** - Backend config
   ```env
   PORT=3001
   GMAIL_USER=teamaarambh01@gmail.com
   GMAIL_APP_PASSWORD=rkzcbqxiuckobrlo
   ```

3. **Both servers running?**
   - Terminal 1: Backend on port 3001
   - Terminal 2: Frontend on port 5173

---

## ✨ Success Checklist

Before testing, ensure:

- [ ] Backend dependencies installed (`server/node_modules` exists)
- [ ] Frontend dependencies installed (`node_modules` exists)
- [ ] Backend server running (see "✅ Email server is ready")
- [ ] Frontend server running (see "Local: http://localhost:5173")
- [ ] Can access http://localhost:3001/health
- [ ] Gmail credentials in `server/.env` are correct

---

**Ready to go! 🎉**

Open http://localhost:5173 and start testing your email OTP authentication!

---

**Built with ❤️ for Aarambh LMS**
