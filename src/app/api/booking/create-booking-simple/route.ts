import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase only if not already initialized
const apps = getApps();
let app;
if (!apps.length) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name,
      email,
      phone,
      pickupLocation, 
      dropoffLocation, 
      pickupDateTime, 
      passengers,
      status,
      fare,
      depositPaid,
      balanceDue,
      flightNumber,
      notes
    } = body;

    // Basic validation
    if (!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime || !passengers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create simple booking object
    const booking = {
      name,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime: new Date(pickupDateTime),
      passengers,
      status: status || 'pending',
      fare: fare || 0,
      depositPaid: depositPaid || false,
      balanceDue: balanceDue || fare || 0,
      flightNumber: flightNumber || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firestore using client SDK
    const docRef = await addDoc(collection(db, 'bookings'), booking);
    
    console.log('✅ Simple booking created successfully:', docRef.id);
    
    return NextResponse.json({
      success: true,
      bookingId: docRef.id,
      message: 'Booking created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating simple booking:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking',
      details: error.code || 'unknown_error'
    }, { status: 500 });
  }
} 