import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    error: 'Download temporarily unavailable',
    message: 'project-x downloads are being updated. Please use the web interface at /project-x-web instead.',
    webInterface: '/project-x-web'
  }, { status: 503 });
} 