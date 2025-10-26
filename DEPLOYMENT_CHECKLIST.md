# Aarambh LMS Deployment Checklist

This checklist will guide you through the complete deployment process for the Aarambh Learning Management System.

## ✅ Pre-Deployment Checklist

### Accounts & Services
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] MongoDB Atlas account (https://cloud.mongodb.com)
- [ ] Gmail account with App Password configured
- [ ] Git repository (GitHub, GitLab, or Bitbucket)

### Environment Preparation
- [ ] Code pushed to Git repository
- [ ] All deployment files verified with `node check-deployment-files.js`
- [ ] Environment variables planned (use `node setup-env.js` for guidance)

## 🚀 Backend Deployment (Render)

### 1. Repository Setup
- [ ] Connect Git repository to Render
- [ ] Create new Web Service
- [ ] Set service name: `aarambh-backend`
- [ ] Set environment: `Node`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`

### 2. Environment Variables Configuration
Set these variables in Render dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `MONGODB_URI` = *your MongoDB connection string*
- [ ] `JWT_SECRET` = *strong secret key*
- [ ] `GMAIL_USER` = *your Gmail address*
- [ ] `GMAIL_APP_PASSWORD` = *your Gmail app password*
- [ ] `GMAIL_FROM_NAME` = `Aarambh LMS`
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `OTP_EXPIRY_MINUTES` = `10`
- [ ] `OTP_LENGTH` = `6`
- [ ] `OTP_MAX_ATTEMPTS` = `3`
- [ ] `ALLOWED_ORIGINS` = `http://localhost:3000` *(update after frontend deployment)*
- [ ] `API_SECRET_KEY` = *strong secret key*
- [ ] `GEMINI_API_KEY` = *your Gemini API key (optional)*
- [ ] `GROQ_API_KEY` = *your Groq API key (optional)*

### 3. Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note the Render app URL (e.g., `https://aarambh-backend.onrender.com`)

## 🌐 Frontend Deployment (Vercel)

### 1. Environment Variables Configuration
Update [.env.production](.env.production) with your actual values:

- [ ] `VITE_API_BASE_URL` = *your Render backend URL* (e.g., `https://aarambh-backend.onrender.com/api`)
- [ ] `VITE_APP_ENV` = `production`
- [ ] `VITE_DEBUG_MODE` = `false`
- [ ] `VITE_APP_URL` = *your Vercel app URL* (will be available after deployment)

### 2. Repository Setup
- [ ] Connect Git repository to Vercel
- [ ] Create new Project
- [ ] Set framework preset: `Vite`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Set install command: `npm install`

### 3. Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note the Vercel app URL (e.g., `https://aarambh-frontend.vercel.app`)

## 🔁 Post-Deployment Configuration

### 1. Update CORS Settings
- [ ] Go to Render dashboard
- [ ] Update `ALLOWED_ORIGINS` environment variable to include your Vercel app URL:
  - Example: `http://localhost:3000,https://aarambh-frontend.vercel.app`

### 2. Redeploy Backend
- [ ] Trigger a new deployment in Render to apply CORS changes

## 🧪 Testing & Verification

### Backend Tests
- [ ] Visit `https://your-render-app.onrender.com/health` (should show server status)
- [ ] Test MongoDB connection status in health check
- [ ] Verify all API endpoints are accessible

### Frontend Tests
- [ ] Visit your Vercel app URL
- [ ] Test user registration flow
- [ ] Verify OTP email delivery
- [ ] Test login functionality
- [ ] Check that all pages load correctly
- [ ] Verify API calls to backend are working

### Integration Tests
- [ ] Test end-to-end user flow (register → login → access dashboard)
- [ ] Test course enrollment functionality
- [ ] Test assignment submission
- [ ] Test grade viewing
- [ ] Test discussion forum

## 🛡️ Security Checklist

- [ ] Verify all sensitive environment variables are set in platform dashboards, not in code
- [ ] Confirm MongoDB Atlas IP whitelist includes Render's IP addresses
- [ ] Test that API endpoints are not accessible without proper authentication
- [ ] Verify HTTPS is working on both frontend and backend
- [ ] Check that no sensitive information is logged

## 📊 Monitoring & Maintenance

- [ ] Set up monitoring for both Render and Vercel applications
- [ ] Configure custom domains if needed
- [ ] Set up logging and error tracking
- [ ] Plan for regular dependency updates
- [ ] Schedule database backups

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Check `ALLOWED_ORIGINS` configuration
2. **Email Not Sending**: Verify Gmail credentials and app password
3. **Database Connection**: Check MongoDB URI and network access
4. **Environment Variables**: Ensure all required variables are set
5. **Build Failures**: Check build logs in Render/Vercel dashboards

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Aarambh DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [Aarambh Documentation](README.md)

## 🎉 Success!

Once all checklist items are completed and verified, your Aarambh LMS should be successfully deployed and accessible to users!

---

*Last updated: Deployment checklist for Aarambh LMS*