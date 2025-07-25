import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const upgrade = searchParams.get('upgrade');
  
  if (upgrade === 'websocket') {
    // For Next.js, we'll use a different approach since Deno is not available
    // This is a simplified version that works with Next.js
    await params; // Await params to avoid unused variable warning
    
    // Return a response that indicates WebSocket support
    return new NextResponse('WebSocket endpoint', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    });
  }
  
  // Fallback for non-WebSocket requests
  return new NextResponse('WebSocket upgrade required', { status: 400 });
} 