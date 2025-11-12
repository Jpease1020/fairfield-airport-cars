import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// NOTE: Environment variables for emulators must be set BEFORE this module is imported
// See: https://firebase.google.com/docs/emulator-suite/connect_firestore
// The environment variables are set in the .env.local file and should be loaded by Next.js

// Check if Firebase Admin is properly configured
const isFirebaseAdminConfigured = () => {
  // If using emulators, don't try to use production credentials
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
    console.log('🔌 Admin SDK: Using emulators, skipping production credentials');
    return false;
  }
  
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_PRIVATE_KEY && 
         process.env.FIREBASE_CLIENT_EMAIL;
};

// Initialize Firebase Admin if credentials are available
let adminDb: any = null;
let adminAuth: any = null;

// Check if we should initialize for emulators
const shouldInitializeForEmulators = process.env.NODE_ENV === 'development' && 
                                    process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

if (isFirebaseAdminConfigured() || shouldInitializeForEmulators) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      if (shouldInitializeForEmulators) {
        // For emulators, initialize without credentials
        console.log('🚀 Initializing Firebase Admin for emulators...');
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
        });
      } else {
        // For production, use service account credentials
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        
        // Better error messages for missing credentials
        if (!projectId) {
          console.error('❌ FIREBASE_PROJECT_ID is missing');
        }
        if (!privateKey) {
          console.error('❌ FIREBASE_PRIVATE_KEY is missing');
        }
        if (!clientEmail) {
          console.error('❌ FIREBASE_CLIENT_EMAIL is missing');
        }
        
        if (!projectId || !privateKey || !clientEmail) {
          throw new Error('Missing required Firebase Admin environment variables. Check FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL');
        }
        
        console.log('🚀 Initializing Firebase Admin for production...');
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Client Email: ${clientEmail}`);
        console.log(`   Private Key: ${privateKey.substring(0, 20)}...`);
        
        initializeApp({
          credential: cert({
            projectId: projectId,
            privateKey: privateKey,
            clientEmail: clientEmail,
          }),
        });
      }
    }
    
    // Initialize services
    adminDb = getFirestore();
    adminAuth = getAuth();
    
    // Configure emulator settings if using emulators
    if (shouldInitializeForEmulators) {
      // Set emulator host for Firestore
      if (process.env.FIREBASE_EMULATOR_HOST) {
        adminDb.settings({
          host: process.env.FIREBASE_EMULATOR_HOST,
          ssl: false
        });
        console.log(`🔌 Admin Firestore connected to emulator: ${process.env.FIREBASE_EMULATOR_HOST}`);
      }
      
      // Set emulator host for Auth
      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        // Auth emulator host is already set in environment
        console.log(`🔌 Admin Auth connected to emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
      }
    }
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    // Don't set adminDb/adminAuth to null - let getAdminDb() throw a clear error
  }
} else {
  console.warn('⚠️ Firebase Admin not configured. Missing environment variables.');
  console.warn('   Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  console.warn('   Or set NEXT_PUBLIC_USE_EMULATORS=true for development');
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