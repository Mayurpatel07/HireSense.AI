import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin SDK
let isFirebaseInitialized = false;

try {
  let serviceAccount: any;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    const serviceAccountPath = path.join(__dirname, '../../firebase-adminsdk.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    }
  }

  if (serviceAccount && serviceAccount.type === 'service_account') {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    isFirebaseInitialized = true;
    console.log('✓ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️  Firebase service account not configured. Google login will not work.');
    console.warn('Setup: Add FIREBASE_SERVICE_ACCOUNT_KEY env var or firebase-adminsdk.json file');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('Google login functionality will be disabled');
}

export { admin, isFirebaseInitialized };
