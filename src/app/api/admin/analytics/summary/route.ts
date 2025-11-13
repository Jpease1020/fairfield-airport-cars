import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const db = getAdminDb();
    
    // Get recent interactions (last 1000)
    const interactionsSnapshot = await db.collection('analytics')
      .where('type', '==', 'interaction')
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();
    
    // Get recent errors (last 1000)
    const errorsSnapshot = await db.collection('analytics')
      .where('type', '==', 'error')
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const interactions = interactionsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const errors = errorsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Aggregate data
    const interactionTypes: Record<string, number> = {};
    const elementTypes: Record<string, number> = {};
    const errorTypes: Record<string, number> = {};

    interactions.forEach(interaction => {
      // Count interaction types
      const type = interaction.interactionType || 'unknown';
      interactionTypes[type] = (interactionTypes[type] || 0) + 1;
      
      // Count element types
      const element = interaction.element || 'unknown';
      elementTypes[element] = (elementTypes[element] || 0) + 1;
    });

    errors.forEach(error => {
      // Count error types
      const type = error.errorType || 'unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    const summary = {
      totalInteractions: interactions.length,
      totalErrors: errors.length,
      interactionTypes,
      errorTypes,
      elementTypes,
      recentErrors: errors.slice(0, 10).map(error => ({
        message: error.message,
        type: error.errorType,
        page: error.page,
        timestamp: error.timestamp?.toDate?.() || error.timestamp
      })),
      recentInteractions: interactions.slice(0, 10).map(interaction => ({
        type: interaction.interactionType,
        element: interaction.element,
        page: interaction.page,
        timestamp: interaction.timestamp?.toDate?.() || interaction.timestamp
      }))
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
} 