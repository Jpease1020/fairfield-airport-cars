// Firebase connection test
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing');
    
    // Initialize Firebase
    let app;
    const apps = getApps();
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = apps[0];
    }
    
    const db = getFirestore(app);
    console.log('Firebase initialized successfully');
    
    // Test a simple read operation with an existing, accessible collection
    const cmsCollection = collection(db, 'cms');
    await getDocs(cmsCollection);
    console.log('Firebase connection test successful - can read from CMS collection');
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};