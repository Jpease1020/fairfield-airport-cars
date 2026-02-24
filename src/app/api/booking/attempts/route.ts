'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/utils/auth-server';

const ATTEMPTS_COLLECTION = 'booking_attempts';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limitValue = limitParam ? parseInt(limitParam, 10) : 50;

    const db = getAdminDb();
    const snapshot = await db.collection(ATTEMPTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(limitValue)
      .get();

    const attempts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error('Failed to fetch booking attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking attempts' },
      { status: 500 }
    );
  }
}

