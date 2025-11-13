// src/app/api/admin/cleanup-smoke-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

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
    
    const db = getAdminDb();
    
    if (bookingId) {
      // Delete specific booking
      const bookingRef = db.collection('bookings').doc(bookingId);
      const bookingDoc = await bookingRef.get();
      
      if (!bookingDoc.exists) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      const bookingData = bookingDoc.data();
      if (!bookingData?._smokeTest) {
        return NextResponse.json({ error: 'Not a smoke test booking' }, { status: 403 });
      }
      
      await bookingRef.delete();
      return NextResponse.json({ 
        success: true,
        message: `Deleted smoke test booking ${bookingId}`
      });
    } else {
      // Delete all smoke test bookings older than 1 hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const snapshot = await db.collection('bookings')
        .where('_smokeTest', '==', true)
        .get();
      
      const deleted: string[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const timestamp = data._smokeTestTimestamp 
          ? new Date(data._smokeTestTimestamp) 
          : null;
        
        // Delete if older than 1 hour or no timestamp
        if (!timestamp || timestamp < oneHourAgo) {
          await docSnapshot.ref.delete();
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

