// Server-safe Firebase utilities (no "use client" directive)
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase - handle existing instances properly
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If app already exists, get the existing one
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    throw new Error('Failed to initialize Firebase');
  }
}

const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators ONLY if explicitly enabled AND not already connected
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  console.log('🔌 Server connecting to Firebase emulators...');
  
  // Connect to Firestore emulator - check if already connected
  if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
    try {
      const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST.split(':');
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      
      // Check if already connected to emulator by testing a simple operation
      try {
        // Try to connect - if it fails, we're probably already connected
        connectFirestoreEmulator(db, host, parseInt(port));
        console.log(`  📊 Firestore emulator: ${host}:${port}`);
      } catch (emulatorError) {
        if (emulatorError instanceof Error && emulatorError.message.includes('already been started')) {
          console.log(`  📊 Firestore emulator: Already connected to ${host}:${port}`);
        } else {
          throw emulatorError;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to connect to Firestore emulator:', error);
    }
  }
  
  // Connect to Auth emulator - check if already connected
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    try {
      const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST.split(':');
      const { connectAuthEmulator } = await import('firebase/auth');
      
      try {
        // Try to connect - if it fails, we're probably already connected
        connectAuthEmulator(auth, `http://${host}:${port}`);
        console.log(`  🔐 Auth emulator: ${host}:${port}`);
      } catch (emulatorError) {
        if (emulatorError instanceof Error && emulatorError.message.includes('already been started')) {
          console.log(`  🔐 Auth emulator: Already connected to ${host}:${port}`);
        } else {
          throw emulatorError;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to connect to Auth emulator:', error);
    }
  }
} else {
  console.log('🚀 Server using production Firebase services');
}

export { app, db, auth };
