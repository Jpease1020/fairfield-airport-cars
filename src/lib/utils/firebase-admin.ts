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

// CRITICAL: Set FIRESTORE_EMULATOR_HOST BEFORE any Firebase Admin SDK calls
// Firebase Admin SDK checks this env var when getFirestore() is called
if (shouldInitializeForEmulators) {
  // Set from explicit env var, NEXT_PUBLIC_ version, or default
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost:8081';
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
    console.log(`🔧 Setting FIRESTORE_EMULATOR_HOST=${emulatorHost}`);
  }
  
  // Also set FIREBASE_AUTH_EMULATOR_HOST if not set
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  }
  
  console.log(`🔌 Emulator configuration:`);
  console.log(`   FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log(`   FIREBASE_AUTH_EMULATOR_HOST: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'not set'}`);
}

if (isFirebaseAdminConfigured() || shouldInitializeForEmulators) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      if (shouldInitializeForEmulators) {
        // For emulators, initialize without credentials
        // FIRESTORE_EMULATOR_HOST must be set BEFORE initializeApp()
        console.log('🚀 Initializing Firebase Admin for emulators...');
        console.log(`   Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}`);
        console.log(`   FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
        });
      } else {
        // For production, use service account credentials
        const projectId = process.env.FIREBASE_PROJECT_ID!.trim();
        let privateKey = process.env.FIREBASE_PRIVATE_KEY!.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim();
        
        // Handle private key formatting - multiple formats
        // First, remove any surrounding quotes
        privateKey = privateKey.replace(/^["']|["']$/g, '');
        
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
        
        // Ensure proper line breaks - private key must have actual newlines
        if (!privateKey.includes('\n')) {
          throw new Error('FIREBASE_PRIVATE_KEY must contain actual newline characters (\\n). The key should be formatted with line breaks.');
        }
        
        console.log('🚀 Initializing Firebase Admin for production...');
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Client Email: ${clientEmail}`);
        console.log(`   Private Key: ${privateKey.length} chars, starts with: ${privateKey.substring(0, 30)}...`);
        console.log(`   Private Key has newlines: ${privateKey.includes('\n')}`);
        
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
          console.error('❌ Firebase Admin initialization failed:', errorMsg);
          
          // Provide specific guidance based on error type
          if (errorMsg.includes('DECODER') || errorMsg.includes('unsupported') || errorMsg.includes('PEM')) {
            throw new Error(`FIREBASE_PRIVATE_KEY format error: ${errorMsg}. The private key may be corrupted or improperly formatted. Ensure it's copied exactly from Firebase Console, including all newlines. See QUICK_VERCEL_SETUP.md`);
          }
          if (errorMsg.includes('private key') || errorMsg.includes('PRIVATE_KEY')) {
            throw new Error(`Invalid FIREBASE_PRIVATE_KEY format: ${errorMsg}. Ensure the key includes -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- with \\n for newlines. See QUICK_VERCEL_SETUP.md`);
          }
          throw certError;
        }
      }
    }
    
    // Initialize services
    // Note: Firebase Admin SDK automatically connects to emulators via environment variables
    // FIRESTORE_EMULATOR_HOST must be set BEFORE getFirestore() is called
    // It should be set in .env.local and loaded by Next.js
    
    adminDb = getFirestore();
    adminAuth = getAuth();
    
    // Log emulator connection status
    if (shouldInitializeForEmulators) {
      const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_EMULATOR_HOST;
      if (emulatorHost) {
        console.log(`✅ Admin Firestore connected to emulator: ${emulatorHost}`);
      } else {
        console.warn('⚠️ WARNING: FIRESTORE_EMULATOR_HOST not detected. Admin SDK may try to use production credentials.');
      }
      
      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.log(`✅ Admin Auth connected to emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
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