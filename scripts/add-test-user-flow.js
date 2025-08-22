#!/usr/bin/env node

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚗 Adding test data for complete user flow...');

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('🔧 Using Firebase project:', firebaseConfig.projectId);

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

// Add test data for complete user flow
const addTestUserFlow = async () => {
  try {
    console.log('🔐 Authenticating for seeding...');
    
    // Sign in anonymously to get authentication
    await signInAnonymously(auth);
    console.log('✅ Authenticated successfully');
    
    console.log('📝 Adding test data...');
    
    // 1. Sample Driver (Gregg) - for tracking
    await setDoc(doc(db, 'drivers', 'driver-001'), {
      id: 'driver-001',
      name: 'Gregg',
      email: 'gregg@fairfieldairportcars.com',
      phone: '(555) 123-4567',
      status: 'active',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'ABC123'
      },
      availability: {
        isAvailable: true,
        currentLocation: {
          lat: 38.2494,
          lng: -122.0399
        }
      },
      rating: 4.9,
      totalTrips: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    // 2. Sample User (Customer) - for booking
    await setDoc(doc(db, 'users', 'customer-001'), {
      uid: 'customer-001',
      email: 'customer@example.com',
      role: 'customer',
      name: 'John Doe',
      phone: '(555) 987-6543',
      createdAt: new Date(),
      lastLogin: new Date(),
      totalBookings: 0,
      totalSpent: 0
    });

    // 3. Sample Booking - for the ride
    await setDoc(doc(db, 'bookings', 'booking-001'), {
      id: 'booking-001',
      userId: 'customer-001',
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '(555) 987-6543',
      pickupLocation: 'Fairfield Airport',
      dropoffLocation: '123 Main St, Fairfield, CA',
      pickupDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'confirmed',
      fare: 65,
      depositPaid: true,
      depositAmount: 13, // 20% of $65
      balanceDue: 52,
      flightNumber: 'AA123',
      notes: 'Please wait at baggage claim',
      driverId: 'driver-001',
      driverName: 'Gregg',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Sample Payment - for the deposit
    await setDoc(doc(db, 'payments', 'payment-001'), {
      id: 'payment-001',
      bookingId: 'booking-001',
      userId: 'customer-001',
      amount: 13,
      type: 'deposit',
      status: 'completed',
      method: 'credit_card',
      squareOrderId: 'demo-order-123',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Driver Location Updates - for real-time tracking
    await setDoc(doc(db, 'driver-locations', 'driver-001'), {
      driverId: 'driver-001',
      currentLocation: {
        lat: 38.2494,
        lng: -122.0399
      },
      heading: 45,
      speed: 35,
      timestamp: new Date(),
      isOnline: true
    });

    console.log('✅ Test data added successfully!');
    console.log('📊 Your emulator now contains:');
    console.log('   - Sample driver (Gregg) for tracking');
    console.log('   - Sample customer user');
    console.log('   - Sample booking with deposit paid');
    console.log('   - Sample payment record');
    console.log('   - Driver location for real-time updates');
    console.log('');
    console.log('🚗 Now you can test the complete user flow:');
    console.log('   1. User books ride ✅');
    console.log('   2. Makes payment ✅');
    console.log('   3. Sees driver approaching ✅');
    
  } catch (error) {
    console.error('❌ Failed to add test data:', error);
  }
};

// Run the test data addition
addTestUserFlow();
