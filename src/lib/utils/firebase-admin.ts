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
  
  // Check all three required variables
  const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  
  if (!hasProjectId || !hasPrivateKey || !hasClientEmail) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Firebase Admin configuration incomplete:');
      if (!hasProjectId) console.error('   Missing: FIREBASE_PROJECT_ID');
      if (!hasPrivateKey) console.error('   Missing: FIREBASE_PRIVATE_KEY');
      if (!hasClientEmail) console.error('   Missing: FIREBASE_CLIENT_EMAIL');
      console.error('   See QUICK_VERCEL_SETUP.md for setup instructions');
    }
    return false;
  }
  
  return true;
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
        const projectId = process.env.FIREBASE_PROJECT_ID!.trim();
        let privateKey = process.env.FIREBASE_PRIVATE_KEY!.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim();
        
        // Handle private key formatting - multiple formats
        // Replace \\n with actual newlines (Vercel format)
        privateKey = privateKey.replace(/\\n/g, '\n');
        // Also handle if it's already escaped differently
        if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }
        
        // Validate private key format
        if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
          throw new Error('FIREBASE_PRIVATE_KEY is malformed. Must include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----. See QUICK_VERCEL_SETUP.md');
        }
        
        console.log('🚀 Initializing Firebase Admin for production...');
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Client Email: ${clientEmail}`);
        console.log(`   Private Key: ${privateKey.length} chars, starts with: ${privateKey.substring(0, 30)}...`);
        
        try {
          initializeApp({
            credential: cert({
              projectId: projectId,
              privateKey: privateKey,
              clientEmail: clientEmail,
            }),
          });
        } catch (certError) {
          const errorMsg = certError instanceof Error ? certError.message : String(certError);
          if (errorMsg.includes('private key') || errorMsg.includes('PRIVATE_KEY')) {
            throw new Error(`Invalid FIREBASE_PRIVATE_KEY format: ${errorMsg}. Ensure the key includes -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- with \\n for newlines. See QUICK_VERCEL_SETUP.md`);
          }
          throw certError;
        }
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