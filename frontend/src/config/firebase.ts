import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB7Vu80cD0M-bLpbG0A_QwjdAyXTKvX1Fo',
  authDomain: 'dnpatel-ca2df.firebaseapp.com',
  projectId: 'dnpatel-ca2df',
  messagingSenderId: '722033391790',
  appId: '1:722033391790:web:10c4bffc3dded9bd53d53f',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase Auth Functions
export const firebaseRegister = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseLogin = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const firebaseSignOut = async () => {
  return await signOut(auth);
};

export default app;

// 2026-03-19 16:42:00 - feat(frontend): implement useResume hook


// 2026-03-20 15:20:00 - feat(frontend): implement useDebounce hook


// 2026-03-25 15:20:00 - feat(frontend): add analytics service


// 2026-04-04 11:42:00 - chore: configure TypeScript settings


// 2026-04-11 12:16:00 - feat(frontend): create useAuth custom hook


// 2026-04-16 10:57:00 - feat(frontend): add useJobs custom hook


// 2026-04-27 13:30:00 - feat(frontend): implement Firebase authentication


// 2026-05-09 15:50:00 - feat(frontend): add JWT token management


// 2026-05-12 10:45:00 - feat(frontend): add report generation


// 2026-05-20 11:31:00 - feat(frontend): implement auth service


// 2026-05-30 09:15:00 - feat(frontend): create analytics dashboard


// 2026-06-02 11:04:00 - feat(frontend): implement Navigation with dropdown


// 2026-06-15 14:03:00 - test(frontend): add component tests

