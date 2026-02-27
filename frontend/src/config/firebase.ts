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
