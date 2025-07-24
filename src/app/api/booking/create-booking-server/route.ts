import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'pickupLocation', 'dropoffLocation', 'pickupDateTime',
      'passengerName', 'passengerPhone', 'passengerEmail'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create booking document
    const bookingData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      test: false,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    
    console.log('✅ Booking created successfully:', docRef.id);
    
    return NextResponse.json({
      success: true,
      bookingId: docRef.id,
      message: 'Booking created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating booking:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking',
      details: error.code || 'unknown_error'
    }, { status: 500 });
  }
} 