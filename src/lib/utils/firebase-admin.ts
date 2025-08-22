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
      const projectId = process.env.FIREBASE_PROJECT_ID;
      
      initializeApp({
        credential: cert({
          projectId: projectId,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    
    // Initialize services
    adminDb = getFirestore();
    adminAuth = getAuth();
    
    // Connect to emulators in development mode using environment variables
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      console.log('🔌 Admin SDK: Using emulator environment variables...');
      
      // Set emulator host for Firestore (Admin SDK reads this automatically)
      if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
        process.env.FIREBASE_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
        console.log(`  📊 Admin Firestore emulator: ${process.env.FIREBASE_EMULATOR_HOST}`);
      }
      
      // Set emulator host for Auth (Admin SDK reads this automatically)
      if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
        console.log(`  🔐 Admin Auth emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
      }
    }
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