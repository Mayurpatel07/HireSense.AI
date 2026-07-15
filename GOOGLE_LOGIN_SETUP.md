# Google Login Implementation Guide

## Overview
Google login has been successfully integrated into your Job-Finder application using Firebase authentication. This setup uses the provided Firebase API credentials and does not use Firebase Storage.

## Changes Made

### Frontend Changes

#### 1. **Firebase Configuration** (`src/config/firebase.ts` - NEW)
- Created Firebase configuration file with your provided API key
- Initialized Firebase Auth module
- Set up Google Authentication Provider

#### 2. **Auth Service** (`src/services/authService.ts`)
- Added `loginWithGoogle()` function
- Authenticates user with Firebase Google sign-in popup
- Sends ID token to backend for verification and user creation/login

#### 3. **Auth Context** (`src/context/AuthContext.tsx`)
- Added `loginWithGoogle()` method to context
- Updated AuthContextType interface to include Google login
- Stores token in localStorage after successful Google login

#### 4. **Login Page** (`src/pages/Login.tsx`)
- Added "Sign in with Google" button with styled Google icon
- Added loading state for Google login
- Included divider between Google login and email/password login
- Maintained demo credentials functionality

### Backend Changes

#### 1. **Firebase Admin Configuration** (`src/config/firebase.ts` - NEW)
- Initializes Firebase Admin SDK for token verification
- Uses service account credentials from environment variable

#### 2. **Auth Controller** (`src/controllers/authController.ts`)
- Added `googleLogin()` endpoint
- Verifies Firebase ID token
- Creates new user if not exists, or logs in existing user
- Returns JWT token for session management

#### 3. **Auth Routes** (`src/routes/authRoutes.ts`)
- Added POST `/auth/google-login` endpoint

### Dependencies Added

#### Frontend (`package.json`)
```json
"firebase": "^10.7.0"
```

#### Backend (`package.json`)
```json
"firebase-admin": "^12.0.0"
```

## Setup Instructions

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 2. Backend Configuration

#### Create Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file

#### Set Environment Variable
**Option A: Environment Variable**
```bash
# In your .env file (backend)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"dnpatel-ca2df",...}'
```

**Option B: Service Account File**
Place the service account JSON file in your backend root directory as `firebase-adminsdk.json`

### 3. Frontend Configuration

The Firebase configuration is already set in `src/config/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: 'AIzaSyB7Vu80cD0M-bLpbG0A_QwjdAyXTKvX1Fo',
  authDomain: 'dnpatel-ca2df.firebaseapp.com',
  projectId: 'dnpatel-ca2df',
  messagingSenderId: '722033391790',
  appId: '1:722033391790:web:10c4bffc3dded9bd53d53f',
};
```

### 4. Firebase Project Settings

Ensure your Firebase project has Google as an enabled authentication provider:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dnpatel-ca2df`
3. Go to Authentication → Sign-in method
4. Enable Google provider
5. Add your application domain to authorized domains

## How It Works

### Google Login Flow

1. **Frontend**: User clicks "Sign in with Google" button
2. **Firebase**: Popup opens for Google authentication
3. **Firebase**: Returns ID token after user signs in
4. **Frontend**: Sends ID token, email, and name to backend
5. **Backend**: 
   - Verifies ID token with Firebase Admin SDK
   - Checks if user exists in database
   - Creates new user if needed
   - Generates JWT token for session
6. **Frontend**: Stores JWT token in localStorage
7. **User**: Logged in and redirected to jobs page

### User Flow
- **Returning Google Users**: Logs in with existing account
- **New Google Users**: Account automatically created with email and name

## API Endpoints

### POST `/auth/google-login`
Authenticates user with Google ID token

**Request Body:**
```json
{
  "idToken": "string (Firebase ID token)",
  "email": "string (user email)",
  "name": "string (user display name)"
}
```

**Response:**
```json
{
  "message": "Google login successful",
  "token": "string (JWT token)",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Security Features

✅ **Firebase Token Verification**: ID tokens are verified server-side
✅ **No Storage Used**: Configuration excludes Firebase Storage
✅ **JWT Token**: Backend generates secure JWT for session management
✅ **Email Validation**: Checks for existing users before creating new ones
✅ **Secure OAuth Flow**: Uses standard Google OAuth 2.0 protocol

## Testing

### Test Google Login
1. Start the backend: `npm run dev` (in backend folder)
2. Start the frontend: `npm run dev` (in frontend folder)
3. Navigate to login page
4. Click "Sign in with Google"
5. Select a Google account or sign in
6. Should redirect to jobs page with user authenticated

### Test Returning User
1. Log out and log back in with the same Google account
2. Should login successfully without creating duplicate user

## Troubleshooting

### "Invalid or expired token" Error
- Ensure Firebase Admin SDK service account is properly configured
- Check that service account JSON has correct credentials

### CORS Issues
- Verify backend CORS configuration allows Firebase domain
- Check that frontend API client is pointing to correct backend URL

### User Not Created
- Verify MongoDB connection is working
- Check User model schema matches controller expectations
- Review backend logs for detailed error messages

### Google Popup Not Appearing
- Check browser console for Firebase errors
- Verify authorized JavaScript origins in Firebase console
- Ensure domain is in authorized domains list

## Notes

- **Storage**: Firebase Storage is not used (as requested)
- **Database**: User data is stored in MongoDB
- **Authentication**: Dual authentication system (Email/Password + Google)
- **Session**: JWT tokens used for authenticated API requests

## Files Modified

```
frontend/
├── src/
│   ├── config/
│   │   └── firebase.ts (NEW)
│   ├── services/
│   │   └── authService.ts (MODIFIED)
│   ├── context/
│   │   └── AuthContext.tsx (MODIFIED)
│   └── pages/
│       └── Login.tsx (MODIFIED)
└── package.json (MODIFIED)

backend/
├── src/
│   ├── config/
│   │   └── firebase.ts (NEW)
│   ├── controllers/
│   │   └── authController.ts (MODIFIED)
│   └── routes/
│       └── authRoutes.ts (MODIFIED)
└── package.json (MODIFIED)
```

## Next Steps

1. Install dependencies in both frontend and backend
2. Configure Firebase service account in backend
3. Test Google login on your local environment
4. Deploy to production with proper environment variables
