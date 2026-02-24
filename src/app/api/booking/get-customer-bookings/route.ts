import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { requireAuth } from '@/lib/utils/auth-server';
import { normalizeEmail, normalizePhone } from '@/lib/utils/auth-session';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const emailParam = searchParams.get('email');
    const phoneParam = searchParams.get('phone');

    const isAdmin = auth.role === 'admin';

    const db = getAdminDb();
    let query = db.collection('bookings');

    if (isAdmin) {
      if (!emailParam && !phoneParam) {
        return NextResponse.json(
          { error: 'Email or phone number is required' },
          { status: 400 }
        );
      }

      if (emailParam) {
        query = query.where('customer.email', '==', emailParam) as any;
      } else if (phoneParam) {
        query = query.where('customer.phone', '==', phoneParam) as any;
      }
    } else {
      const authEmail = normalizeEmail(auth.email);
      const authPhone = normalizePhone(auth.phone);

      if (auth.uid) {
        query = query.where('customerUserId', '==', auth.uid) as any;
      } else if (authEmail) {
        query = query.where('customer.email', '==', authEmail) as any;
      } else if (authPhone) {
        query = query.where('customer.phone', '==', authPhone) as any;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    let snapshot = await query.get();

    if (!isAdmin) {
      const authEmail = normalizeEmail(auth.email);
      const authPhone = normalizePhone(auth.phone);

      if (snapshot.empty && authEmail) {
        query = db.collection('bookings').where('customer.email', '==', authEmail) as any;
        snapshot = await query.get();
      }

      if (snapshot.empty && authPhone) {
        query = db.collection('bookings').where('customer.phone', '==', authPhone) as any;
        snapshot = await query.get();
      }
    }

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        bookings: [],
      });
    }

    const bookings = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pickupDateTime: data.trip?.pickupDateTime?.toDate?.()?.toISOString() ||
          data.pickupDateTime?.toDate?.()?.toISOString() ||
          data.pickupDateTime,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    bookings.sort((a: any, b: any) => {
      const dateA = a.pickupDateTime ? new Date(a.pickupDateTime).getTime() : 0;
      const dateB = b.pickupDateTime ? new Date(b.pickupDateTime).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
