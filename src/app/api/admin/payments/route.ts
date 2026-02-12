import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Helper to safely convert Firestore dates to ISO strings
const safeToDate = (dateField: any): string | null => {
  if (!dateField) return null;
  if (dateField instanceof Date) return dateField.toISOString();
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate().toISOString();
  }
  if (typeof dateField === 'string') {
    if (dateField.includes('T') && dateField.includes('Z')) {
      return dateField;
    }
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
};

export async function GET() {
  try {
    const db = getAdminDb();

    // Get all payments, ordered by creation date (most recent first)
    const snapshot = await db.collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const payments = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        customerName: data.customerName || 'Unknown',
        customerEmail: data.customerEmail || '',
        bookingId: data.bookingId || '',
        amount: data.amount || 0,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || '',
        paymentType: data.paymentType || 'full',
        stripePaymentId: data.stripePaymentId || '',
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        refundAmount: data.refundAmount,
        refundReason: data.refundReason,
      };
    });

    console.log(`✅ [GET-PAYMENTS] Retrieved ${payments.length} payments`);
    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error: any) {
    console.error('❌ [GET-PAYMENTS] Error getting payments:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get payments',
      payments: [] // Return empty array so page can still render
    }, { status: 500 });
  }
}
