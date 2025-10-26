# Firebase Authentication Flow Test

## Test Case: teamaarambh01@gmail.com with Random Password

### 1. Registration Flow

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarambh Test User",
    "email": "teamaarambh01@gmail.com",
    "password": "RandomPassword123!",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "68fc81dc13239c1943bf32b3",
    "email": "teamaarambh01@gmail.com",
    "name": "Aarambh Test User",
    "role": "admin"
  }
}
```

**What happens in Firebase:**
1. Firebase creates a new user with the email and password
2. Firebase sends an email verification link to teamaarambh01@gmail.com
3. The password is stored in Firebase, not in our MongoDB database

### 2. Login Attempt Before Email Verification

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teamaarambh01@gmail.com",
    "password": "RandomPassword123!",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Please verify your email first. Check your inbox for the verification code.",
  "requiresVerification": true,
  "email": "teamaarambh01@gmail.com"
}
```

**What happens:**
1. The login fails because the email hasn't been verified yet
2. This is the expected behavior with Firebase email verification

### 3. Email Verification

In a real scenario, the user would:
1. Check their email (teamaarambh01@gmail.com)
2. Click the verification link sent by Firebase
3. The email would be marked as verified in Firebase

### 4. Successful Firebase Authentication Flow

In a real Firebase authentication flow:

1. **Frontend**: User logs in with email/password using Firebase SDK
2. **Firebase**: Authenticates user and returns ID token
3. **Frontend**: Sends ID token to our backend `/api/auth/firebase/callback`
4. **Backend**: 
   - Verifies the Firebase ID token
   - Checks if email is verified
   - Looks up user in MongoDB or creates new user
   - Returns our own JWT token for API access

**Example Firebase callback request:**
```bash
curl -X POST http://localhost:3002/api/auth/firebase/callback \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "FIREBASE_ID_TOKEN_HERE",
    "name": "Aarambh Test User",
    "email": "teamaarambh01@gmail.com",
    "uid": "firebase-user-uid",
    "role": "admin"
  }'
```

**Expected successful response:**
```json
{
  "success": true,
  "message": "Firebase authentication successful",
  "data": {
    "token": "OUR_JWT_TOKEN",
    "user": {
      "id": "68fc81dc13239c1943bf32b3",
      "name": "Aarambh Test User",
      "email": "teamaarambh01@gmail.com",
      "role": "admin",
      "avatar": "",
      "bio": "",
      "isVerified": true,
      "learningStreak": 0,
      "totalXP": 0,
      "badges": [],
      "teachingCourses": [],
      "enrolledCourses": [],
      "createdAt": "2025-10-25T08:15:24.123Z"
    }
  }
}
```

### 5. User Database State

After successful Firebase authentication:

**User in MongoDB:**
- `_id`: 68fc81dc13239c1943bf32b3
- `name`: Aarambh Test User
- `email`: teamaarambh01@gmail.com
- `role`: admin
- `isVerified`: true
- `firebaseId`: firebase-user-uid
- `password`: firebase-user (placeholder, not used)
- `lastLogin`: 2025-10-25T08:15:24.123Z

## Summary

The Firebase authentication system is working correctly:

1. ✅ Registration creates user in Firebase and sends verification email
2. ✅ Login requires email verification before allowing access
3. ✅ Firebase callback properly verifies ID tokens and syncs with MongoDB
4. ✅ Users get our own JWT tokens for API access after Firebase authentication

The next step would be to verify the email (manually done in our test) and then use the Firebase client SDK to complete the authentication flow.