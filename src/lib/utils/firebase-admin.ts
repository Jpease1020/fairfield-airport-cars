import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Check if Firebase Admin is properly configured
const isFirebaseAdminConfigured = () => {
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_PRIVATE_KEY && 
         process.env.FIREBASE_CLIENT_EMAIL;
};

// Initialize Firebase Admin if credentials are available
let adminDb: any = null;
let adminAuth: any = null;

if (isFirebaseAdminConfigured()) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    
    // Initialize services only if app is initialized
    adminDb = getFirestore();
    adminAuth = getAuth();
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Export Firestore instance with fallback
export const getAdminDb = () => {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized. Check environment variables.');
  }
  return adminDb;
};

// Export Auth instance with fallback
export const getAdminAuth = () => {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized. Check environment variables.');
  }
  return adminAuth;
};

// Export admin services with fallback
export const adminServices = {
  get firestore() {
    return getAdminDb();
  },
  get auth() {
    return getAdminAuth();
  },
}; 