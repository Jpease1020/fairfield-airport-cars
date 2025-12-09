import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let query = db.collection('bookings');

    // Build query based on provided identifier
    if (email) {
      query = query.where('customer.email', '==', email) as any;
    } else if (phone) {
      // Normalize phone number for comparison (remove formatting)
      const normalizedPhone = phone.replace(/\D/g, '');
      // Try both customer.phone and phone fields, and handle formatted/unformatted
      query = query.where('customer.phone', '==', phone) as any;
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        bookings: []
      });
    }

    const bookings = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firebase timestamps to ISO strings
        pickupDateTime: data.trip?.pickupDateTime?.toDate?.()?.toISOString() || 
                        data.pickupDateTime?.toDate?.()?.toISOString() || 
                        data.pickupDateTime,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Sort by pickupDateTime (upcoming first)
    bookings.sort((a: any, b: any) => {
      const dateA = a.pickupDateTime ? new Date(a.pickupDateTime).getTime() : 0;
      const dateB = b.pickupDateTime ? new Date(b.pickupDateTime).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

