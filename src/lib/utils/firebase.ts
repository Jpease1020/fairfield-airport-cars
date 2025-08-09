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
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.firebasestorage.app",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b",
  measurementId: "G-EGTW0BCMLN"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch {
  // If app already exists, get the existing one
  const existingApps = getApps();
  app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
}

const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Messaging (client-side only)
let messaging: any = null;
if (typeof window !== 'undefined') {
  (async () => {
    try {
      const { getMessaging } = await import('firebase/messaging');
      messaging = getMessaging(app);
    } catch (error) {
      // Messaging is optional; log and continue
      console.warn('Firebase Messaging not available:', error);
    }
  })();
}

export { app, db, auth, messaging };
