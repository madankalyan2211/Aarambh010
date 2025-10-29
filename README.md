# Aarambh LMS Backend - Force Redeployment 2025-10-29

## Installation

- [Homebrew](https://render.com/docs/cli#homebrew-macos-linux)
- [Direct Download](https://render.com/docs/cli#direct-download)

## Documentation

Documentation is hosted at https://render.com/docs/cli

## Aarambh LMS Backend

This is the backend for the Aarambh LMS application. It provides RESTful APIs for user authentication, course management, assignment submission, and more.

### Features

- User authentication (Google OAuth, Email/Password)
- Course management
- Assignment submission and grading
- Real-time messaging with Socket.IO
- Email notifications
- Firebase integration

### Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- Firebase Admin SDK
- Socket.IO
- Nodemailer
- JWT for authentication

### Environment Variables

The application requires several environment variables to be set. See `.env.example` for a complete list.

### Deployment

The application is deployed on Render. Any changes to the main branch will trigger a new deployment.

### Force Redeployment

This change is made to force a redeployment of the application on Render.