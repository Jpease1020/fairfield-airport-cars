import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const error = await request.json();

    // Validate required fields
    if (!error.message || !error.type || !error.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize and prepare data for storage
    const errorData = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      errorType: error.type,
      element: error.element,
      page: error.page,
      timestamp: new Date(error.timestamp),
      userId: error.userId,
      context: error.context,
      createdAt: serverTimestamp()
    };

    // Store in Firestore
    const analyticsCollection = collection(db, 'analytics');
    await addDoc(analyticsCollection, errorData);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Error stored:', errorData);
    }

    // In production, you could send notifications for critical errors
    if (process.env.NODE_ENV === 'production' && error.type === 'javascript') {
      // Send notification for JavaScript errors
      await sendErrorNotification(errorData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing error:', error);
    return NextResponse.json(
      { error: 'Failed to store error' },
      { status: 500 }
    );
  }
}

// Send error notification (placeholder for production)
async function sendErrorNotification(errorData: any) {
  try {
    // This could send to Slack, email, or other notification service
    console.log('🔔 Error notification:', errorData);
    
    // Example: Send to webhook
    if (process.env.ERROR_WEBHOOK_URL) {
      await fetch(process.env.ERROR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Error detected: ${errorData.message}`,
          error: errorData
        })
      });
    }
  } catch (e) {
    console.error('Failed to send error notification:', e);
  }
} 