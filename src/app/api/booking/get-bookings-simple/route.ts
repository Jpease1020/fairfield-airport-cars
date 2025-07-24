import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (bookingId) {
      // Get specific booking
      const docRef = doc(db, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      const booking = {
        id: docSnap.id,
        ...docSnap.data()
      };

      console.log('✅ Simple booking retrieved successfully:', bookingId);
      
      return NextResponse.json({
        success: true,
        booking
      });
    } else {
      // Get all bookings (limit to 50)
      const q = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);

      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ Simple bookings retrieved successfully:', bookings.length);
      
      return NextResponse.json({
        success: true,
        bookings
      });
    }

  } catch (error: any) {
    console.error('❌ Error getting simple bookings:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get bookings',
      details: error.code || 'unknown_error'
    }, { status: 500 });
  }
} 