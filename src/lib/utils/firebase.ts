// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// NOTE: Do not import firebase/messaging at module scope.
// The messaging package accesses browser globals at import time and will crash on the server.
// We dynamically import it only when running in the browser.

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug: Log Firebase config (without sensitive data)
console.log('🔥 Firebase Config Check:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  // If app already exists, get the existing one
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('🔄 Using existing Firebase app');
  } else {
    throw new Error('Failed to initialize Firebase');
  }
}

const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔥 Firestore database initialized:', db);
console.log('🔥 Firebase auth initialized:', auth);

// Initialize Firebase Messaging (client-side only)
let messaging: any = null;
if (typeof window !== 'undefined') {
  (async () => {
    try {
      const { getMessaging } = await import('firebase/messaging');
      messaging = getMessaging(app);
      console.log('✅ Firebase messaging initialized');
    } catch (error) {
      // Messaging is optional; log and continue
      console.warn('Firebase Messaging not available:', error);
    }
  })();
}

export { app, db, auth, messaging };
