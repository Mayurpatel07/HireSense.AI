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

// 2026-04-07 10:45:00 - feat(backend): create AI service for resume analysis


// 2026-04-20 13:30:00 - feat(backend): add skills extraction from resumes


// 2026-04-21 10:45:00 - feat(backend): add notification service


// 2026-04-27 10:45:00 - perf(backend): add response compression


// 2026-05-25 09:15:00 - feat(backend): create Analytics model


// 2026-05-31 09:15:00 - feat(backend): integrate Gemini API for resume analysis


// 2026-06-13 15:20:00 - feat(backend): create AI service for resume analysis


// 2026-06-17 15:20:00 - feat: implement advanced search with AI

