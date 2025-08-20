#!/usr/bin/env node

/**
 * Seed Firebase Emulators with Test Data
 * 
 * This script populates your local Firebase emulators with realistic test data
 * for development and testing purposes.
 * 
 * Usage:
 *   node scripts/seed-emulator-data.js
 * 
 * Prerequisites:
 *   - Firebase emulators must be running
 *   - Set NEXT_PUBLIC_USE_EMULATORS=true in your .env.local
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config (will use emulators if NEXT_PUBLIC_USE_EMULATORS=true)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.firebasestorage.app",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b",
  measurementId: "G-EGTW0BCMLN"
};

// Test data
const testUsers = [
  {
    email: 'test@fairfieldcars.com',
    password: 'testpass123',
    displayName: 'Test User'
  },
  {
    email: 'driver@fairfieldcars.com', 
    password: 'driver123',
    displayName: 'Test Driver'
  }
];

const testDrivers = [
  {
    id: 'gregg-main-driver',
    name: 'Gregg',
    phone: '(203) 555-0123',
    vehicle: 'Toyota Highlander',
    licensePlate: 'CT-ABC123',
    status: 'available',
    currentLocation: {
      lat: 41.1792, // Fairfield, CT coordinates
      lng: -73.1894
    },
    lastUpdated: new Date()
  }
];

const testBookings = [
  {
    pickupLocation: 'Fairfield Station, Fairfield, CT',
    dropoffLocation: 'JFK Airport, Queens, NY',
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    passengers: 2,
    fare: 125.00,
    status: 'pending',
    email: 'test@fairfieldcars.com',
    phone: '(203) 555-0123',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const cmsConfiguration = {
  business: {
    name: 'Fairfield Airport Cars',
    phone: '(203) 555-0123',
    email: 'info@fairfieldcars.com',
    address: 'Fairfield Station, Fairfield, CT',
    hours: '24/7 Service'
  },
  pricing: {
    baseFare: 25.00,
    perMile: 2.50,
    perMinute: 0.50,
    depositPercent: 20,
    bufferMinutes: 15,
    cancellation: 10.00
  },
  content: {
    heroTitle: 'Reliable Airport Transportation',
    heroSubtitle: 'Professional service to all major airports',
    aboutText: 'Fairfield Airport Cars provides reliable, professional transportation to all major airports in the region.',
    contactText: 'Contact us for your airport transportation needs.'
  }
};

async function seedData() {
  try {
    console.log('🚀 Starting Firebase Emulator Data Seeding...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized');
    
    // Create test users
    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Failed to create user ${userData.email}:`, error.message);
        }
      }
    }
    
    // Add test drivers
    console.log('🚗 Adding test drivers...');
    for (const driver of testDrivers) {
      try {
        await setDoc(doc(db, 'drivers', driver.id), driver);
        console.log(`✅ Added driver: ${driver.name}`);
      } catch (error) {
        console.error(`❌ Failed to add driver ${driver.name}:`, error.message);
      }
    }
    
    // Add test bookings
    console.log('📅 Adding test bookings...');
    for (const booking of testBookings) {
      try {
        await addDoc(collection(db, 'bookings'), booking);
        console.log(`✅ Added test booking`);
      } catch (error) {
        console.error(`❌ Failed to add test booking:`, error.message);
      }
    }
    
    // Add CMS configuration
    console.log('⚙️ Adding CMS configuration...');
    try {
      await setDoc(doc(db, 'cms', 'configuration'), cmsConfiguration);
      console.log('✅ Added CMS configuration');
    } catch (error) {
      console.error('❌ Failed to add CMS configuration:', error.message);
    }
    
    console.log('🎉 Data seeding completed successfully!');
    console.log('');
    console.log('📊 Your emulators now contain:');
    console.log('   • Test users (test@fairfieldcars.com, driver@fairfieldcars.com)');
    console.log('   • Test driver (Gregg)');
    console.log('   • Sample booking');
    console.log('   • CMS configuration');
    console.log('');
    console.log('🔑 Test user credentials:');
    console.log('   • test@fairfieldcars.com / testpass123');
    console.log('   • driver@fairfieldcars.com / driver123');
    
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedData();
