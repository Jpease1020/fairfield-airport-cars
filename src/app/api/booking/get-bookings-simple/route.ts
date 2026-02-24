import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from '@/lib/utils/auth-server';

// Helper to safely convert Firestore dates to ISO strings
const safeToDate = (dateField: any): string | null => {
  if (!dateField) return null;
  if (dateField instanceof Date) return dateField.toISOString();
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate().toISOString();
  }
  if (typeof dateField === 'string') {
    // If already ISO string, return as-is
    if (dateField.includes('T') && dateField.includes('Z')) {
      return dateField;
    }
    // Otherwise try to parse
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    const db = getAdminDb();

    if (bookingId) {
      // Get specific booking using Admin SDK (no auth required)
      const docRef = db.collection('bookings').doc(bookingId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        console.error(`❌ [GET-BOOKINGS] Booking ${bookingId} not found`);
        return NextResponse.json(
          { 
            success: false,
            error: 'Booking not found' 
          },
          { status: 404 }
        );
      }

      const rawData = docSnap.data();
      if (!rawData) {
        console.error(`❌ [GET-BOOKINGS] Booking ${bookingId} has no data`);
        return NextResponse.json(
          { 
            success: false,
            error: 'Booking data is missing' 
          },
          { status: 500 }
        );
      }

      // Convert Firestore timestamps and format booking
      const booking = {
        id: docSnap.id,
        ...rawData,
        pickupDateTime: safeToDate(rawData.pickupDateTime),
        createdAt: safeToDate(rawData.createdAt),
        updatedAt: safeToDate(rawData.updatedAt),
        confirmation: rawData.confirmation
          ? {
              status: rawData.confirmation.status ?? 'pending',
              sentAt: rawData.confirmation.sentAt ? safeToDate(rawData.confirmation.sentAt) : null,
              confirmedAt: rawData.confirmation.confirmedAt ? safeToDate(rawData.confirmation.confirmedAt) : null
            }
          : undefined
      };

      const accessResult = await requireOwnerOrAdmin(request, booking);
      if (!accessResult.ok) return accessResult.response;
      const auth = accessResult.auth;
      if (auth && auth.role !== 'admin' && booking.confirmation?.token) {
        booking.confirmation = {
          status: booking.confirmation.status,
          sentAt: booking.confirmation.sentAt,
          confirmedAt: booking.confirmation.confirmedAt,
        };
      }
      
      console.log(`✅ [GET-BOOKINGS] Retrieved booking ${bookingId}`);
      return NextResponse.json({
        success: true,
        booking
      });
    } else {
      const adminResult = await requireAdmin(request);
      if (!adminResult.ok) return adminResult.response;

      // Get all bookings (limit to 50) - Admin only, requires auth check in production
      const snapshot = await db.collection('bookings')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const bookings = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          pickupDateTime: safeToDate(data.pickupDateTime),
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          confirmation: data.confirmation
            ? {
                status: data.confirmation.status ?? 'pending',
                sentAt: data.confirmation.sentAt ? safeToDate(data.confirmation.sentAt) : null,
                confirmedAt: data.confirmation.confirmedAt ? safeToDate(data.confirmation.confirmedAt) : null
              }
            : undefined
        };
      });
      
      return NextResponse.json({
        success: true,
        bookings
      });
    }

  } catch (error: any) {
    console.error('❌ [GET-BOOKINGS] Error getting bookings:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get bookings',
      details: error.code || 'unknown_error'
    }, { status: 500 });
  }
} 
