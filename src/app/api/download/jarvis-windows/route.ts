import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Download temporarily unavailable',
    message: 'Jarvis downloads are being updated. Please use the web interface at /jarvis-web instead.',
    webInterface: '/jarvis-web'
  }, { status: 503 });
} 