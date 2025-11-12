// src/app/api/admin/cleanup-smoke-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/utils/firebase-server';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in smoke test mode
    const smokeTestHeader = request.headers.get('x-smoke-test');
    const isSmokeTest = smokeTestHeader === 'true' || process.env.SMOKE_TEST_MODE === 'true';
    
    if (!isSmokeTest) {
      return NextResponse.json({ error: 'Unauthorized - smoke test only' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (bookingId) {
      // Delete specific booking
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      const bookingData = bookingDoc.data();
      if (!bookingData._smokeTest) {
        return NextResponse.json({ error: 'Not a smoke test booking' }, { status: 403 });
      }
      
      await deleteDoc(bookingRef);
      return NextResponse.json({ 
        success: true,
        message: `Deleted smoke test booking ${bookingId}`
      });
    } else {
      // Delete all smoke test bookings older than 1 hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const smokeTestQuery = query(
        collection(db, 'bookings'),
        where('_smokeTest', '==', true)
      );
      
      const snapshot = await getDocs(smokeTestQuery);
      const deleted: string[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const timestamp = data._smokeTestTimestamp 
          ? new Date(data._smokeTestTimestamp) 
          : null;
        
        // Delete if older than 1 hour or no timestamp
        if (!timestamp || timestamp < oneHourAgo) {
          await deleteDoc(docSnapshot.ref);
          deleted.push(docSnapshot.id);
        }
      }
      
      return NextResponse.json({ 
        success: true,
        deleted: deleted.length,
        bookingIds: deleted
      });
    }
  } catch (error) {
    console.error('Error cleaning up smoke test bookings:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup smoke test bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

