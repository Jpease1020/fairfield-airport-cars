import { NextResponse } from 'next/server';
import { cleanupExpiredQuotes } from '@/lib/services/quote-service';

export async function POST(request: Request) {
  try {
    const deletedCount = await cleanupExpiredQuotes();
    
    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} expired quotes`
    });
  } catch (error) {
    console.error('Cleanup quotes error:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup expired quotes' 
    }, { status: 500 });
  }
}
