"use client";

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

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

// Initialize Firebase
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

// Connect to emulators ONLY if explicitly enabled
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  console.log('🔌 Connecting to Firebase emulators...');
  
  // Connect to Firestore emulator (using fixed port 8081)
  if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
    const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST.split(':');
    connectFirestoreEmulator(db, host, parseInt(port));
    console.log(`  📊 Firestore emulator: ${host}:${port}`);
  }
  
  // Connect to Auth emulator
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST.split(':');
    connectAuthEmulator(auth, `http://${host}:${port}`);
    console.log(`  🔐 Auth emulator: ${host}:${port}`);
  }
} else {
  console.log('🚀 Using production Firebase services');
}

// Initialize Firebase Messaging (client-side only)
let messaging: any = null;
if (typeof window !== 'undefined') {
  (async () => {
    try {
      const { getMessaging } = await import('firebase/messaging');
      messaging = getMessaging(app);
    } catch (error) {
      // Messaging is optional; continue without it
    }
  })();
}

export { app, db, auth, messaging };
