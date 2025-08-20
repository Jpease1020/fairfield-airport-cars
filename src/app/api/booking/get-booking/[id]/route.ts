import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.appspot.com",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b",
  measurementId: "G-EGTW0BCMLN"
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

// Helper function to safely convert Firestore dates to JavaScript Date objects
const safeToDate = (dateField: any): Date => {
  if (!dateField) return new Date();
  
  // If it's already a Date
  if (dateField instanceof Date) return dateField;
  
  // If it's a Firestore Timestamp
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  
  // If it's a string or number, try to parse it
  if (typeof dateField === 'string' || typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  
  // Fallback to current date
  return new Date();
};

// Function to create default test booking
const createDefaultTestBooking = async () => {
  const defaultTestBooking = {
    id: 'test-booking-123',
    name: 'John Smith (Test)',
    email: 'test@fairfieldairportcars.com',
    phone: '203-555-0123',
    pickupLocation: 'Fairfield Station, Fairfield, CT',
    dropoffLocation: 'JFK Airport, Queens, NY',
    pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    passengers: 2,
    status: 'confirmed',
    fare: 150.00,
    dynamicFare: 150.00,
    depositPaid: true,
    balanceDue: 0,
    flightNumber: 'AA123',
    notes: 'This is a test booking for demo purposes',
    driverId: '',
    driverName: 'Gregg',
    estimatedArrival: new Date(Date.now() + 23 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min before pickup
    depositAmount: 75.00,
    tipAmount: 20.00,
    totalFare: 170.00,
    isTestBooking: true,
    testCreatedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'bookings'), defaultTestBooking);
    console.log('✅ Default test booking created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to create default test booking:', error);
    throw error;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Special handling for test-booking-123 - return demo data directly
    if (id === 'test-booking-123') {
      console.log('✅ Returning demo test booking for:', id);
      
      // Create a demo test booking object
      const demoBooking = {
        id: 'test-booking-123',
        name: 'John Smith (Test)',
        email: 'test@fairfieldairportcars.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        passengers: 2,
        status: 'confirmed',
        fare: 150.00,
        dynamicFare: 150.00,
        depositPaid: true,
        balanceDue: 0,
        flightNumber: 'AA123',
        notes: 'This is a test booking for demo purposes',
        driverId: '',
        driverName: 'Gregg',
        estimatedArrival: new Date(Date.now() + 23 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min before pickup
        depositAmount: 75.00,
        tipAmount: 20.00,
        totalFare: 170.00,
        isTestBooking: true,
        testCreatedAt: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        driverLocation: {
          lat: 41.1408,
          lng: -73.2613,
          timestamp: new Date(),
          heading: 45,
          speed: 35
        },
        flightInfo: {
          airline: 'American Airlines',
          flightNumber: 'AA123',
          arrivalTime: '10:00 AM',
          terminal: '8'
        }
      };
      
      // Also try to save it to Firebase in the background (don't wait for it)
      createDefaultTestBooking().catch(error => {
        console.log('Note: Could not save test booking to Firebase:', error.message);
      });
      
      return NextResponse.json(demoBooking);
    }
    
    // For all other IDs, try to find by Firestore document ID first
    let bookingDoc = await getDoc(doc(db, 'bookings', id));
    
    // If not found by Firestore ID, try to find by custom ID field
    if (!bookingDoc.exists()) {
      const customIdQuery = query(
        collection(db, 'bookings'),
        where('id', '==', id)
      );
      
      const customIdSnapshot = await getDocs(customIdQuery);
      
      if (!customIdSnapshot.empty) {
        // Found by custom ID
        bookingDoc = customIdSnapshot.docs[0] as any;
      }
    }
    
    if (!bookingDoc.exists()) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    const data = bookingDoc.data();
    
    // Transform the data to match the expected format
    const booking = {
      id: bookingDoc.id,
      ...data,
      pickupDateTime: safeToDate(data.pickupDateTime),
      createdAt: safeToDate(data.createdAt),
      updatedAt: safeToDate(data.updatedAt),
    };
    
    console.log('✅ Real booking retrieved successfully:', id);
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    );
  }
} 