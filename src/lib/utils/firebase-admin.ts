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
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Export Firestore instance
export const adminDb = getFirestore();

// Export Auth instance
export const adminAuth = getAuth();

// Export admin services
export const adminServices = {
  firestore: adminDb,
  auth: adminAuth,
}; 