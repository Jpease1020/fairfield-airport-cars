import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const interaction = await request.json();

    // Validate required fields
    if (!interaction.type || !interaction.element || !interaction.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize and prepare data for storage
    const analyticsData = {
      type: 'interaction',
      interactionType: interaction.type,
      element: interaction.element,
      elementId: interaction.elementId,
      elementClass: interaction.elementClass,
      page: interaction.page,
      timestamp: new Date(interaction.timestamp),
      userId: interaction.userId,
      sessionId: interaction.sessionId,
      success: interaction.success,
      error: interaction.error,
      duration: interaction.duration,
      userAgent: interaction.userAgent,
      viewport: interaction.viewport,
      context: interaction.context,
      createdAt: serverTimestamp()
    };

    // Store in Firestore
    const analyticsCollection = collection(db, 'analytics');
    await addDoc(analyticsCollection, analyticsData);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Interaction stored:', analyticsData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json(
      { error: 'Failed to store interaction' },
      { status: 500 }
    );
  }
} 