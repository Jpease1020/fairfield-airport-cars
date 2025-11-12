'use server';

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase-server';

const ATTEMPTS_COLLECTION = 'booking_attempts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limitValue = limitParam ? parseInt(limitParam, 10) : 50;

    const attemptsQuery = query(
      collection(db, ATTEMPTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitValue)
    );

    const snapshot = await getDocs(attemptsQuery);
    const attempts = snapshot.docs.map((doc) => ({
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


