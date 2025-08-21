#!/usr/bin/env node

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';
import fs from 'fs/promises';
import path from 'path';

console.log('🌱 Seeding emulator with production CMS data...');

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase for emulator
let app;
const apps = getApps();
if (apps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
try {
  connectFirestoreEmulator(db, 'localhost', 8081);
  console.log('📊 Connected to Firestore emulator on port 8081');
} catch (error) {
  if (error.code === 'failed-precondition') {
    console.log('📊 Firestore emulator already connected');
  } else {
    console.log('📊 Firestore emulator connection:', error.message);
  }
}

try {
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('🔐 Connected to Auth emulator on port 9099');
} catch (error) {
  if (error.code === 'failed-precondition') {
    console.log('🔐 Auth emulator already connected');
  } else {
    console.log('🔐 Auth emulator connection:', error.message);
  }
}

// Replace problematic values with fake data instead of removing them
const replaceWithFakeData = (obj) => {
  if (obj === null || obj === undefined) {
    return "Content not available";
  }
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(replaceWithFakeData);
    } else {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip Firebase-specific fields
        if (key === 'createTime' || key === 'updateTime') {
          continue;
        }
        
        // Replace Firebase timestamp objects with current date
        if (value && typeof value === 'object' && ('_seconds' in value || '_nanoseconds' in value)) {
          cleaned[key] = new Date();
          continue;
        }
        
        // Replace undefined with fake content
        if (value === undefined) {
          if (key.includes('title')) {
            cleaned[key] = "Sample Title";
          } else if (key.includes('description') || key.includes('content')) {
            cleaned[key] = "This is sample content that can be edited through the CMS.";
          } else if (key.includes('email')) {
            cleaned[key] = "sample@example.com";
          } else if (key.includes('phone')) {
            cleaned[key] = "(555) 123-4567";
          } else if (key.includes('name')) {
            cleaned[key] = "Sample Name";
          } else if (key.includes('url') || key.includes('website')) {
            cleaned[key] = "https://example.com";
          } else if (typeof value === 'string') {
            cleaned[key] = "Sample content";
          } else {
            cleaned[key] = "Content not available";
          }
        } else {
          cleaned[key] = replaceWithFakeData(value);
        }
      }
      return cleaned;
    }
  }
  
  return obj;
};

// Seed emulator with production data
const seedFromProduction = async () => {
  try {
    console.log('🔐 Authenticating for seeding...');
    
    // Sign in anonymously to get authentication
    await signInAnonymously(auth);
    console.log('✅ Authenticated successfully');
    
    // Load the production data
    const dataDir = path.join(process.cwd(), 'temp', 'cms-data');
    const allDataPath = path.join(dataDir, 'all-cms-data.json');
    
    console.log('📁 Loading production CMS data...');
    
    try {
      const dataContent = await fs.readFile(allDataPath, 'utf8');
      const cmsData = JSON.parse(dataContent);
      
      console.log(`📊 Found ${Object.keys(cmsData).length} CMS documents`);
      
      // Seed each document to the emulator
      for (const [docId, data] of Object.entries(cmsData)) {
        console.log(`📝 Seeding: ${docId}`);
        
        // Replace problematic values with fake data
        const enhancedData = replaceWithFakeData(data);
        
        // Add current timestamp
        const updatedData = {
          ...enhancedData,
          lastUpdated: new Date()
        };
        
        await setDoc(doc(db, 'cms', docId), updatedData);
        console.log(`✅ Seeded: ${docId}`);
      }
      
      console.log('✅ Emulator seeded successfully with production data!');
      console.log(`📊 Total documents seeded: ${Object.keys(cmsData).length}`);
      console.log('💡 All problematic values have been replaced with realistic fake data');
      
    } catch (fileError) {
      console.error('❌ Could not load production data file:', fileError.message);
      console.log('💡 Make sure you have run the pull-cms-data script first');
      console.log('💡 Or check if the data file exists at:', allDataPath);
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

// Run the seeding
seedFromProduction();
