import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, this should be a database
const userSessions = new Map<string, { apiKey: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { action, apiKey, sessionId } = await request.json();

    if (action === 'login') {
      if (!apiKey || apiKey.trim().length === 0) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }

      // Generate a session ID
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      // Store the session with API key (expires in 24 hours)
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      userSessions.set(sessionId, { apiKey, expiresAt });

      return NextResponse.json({ 
        success: true, 
        sessionId,
        message: 'Successfully authenticated with your API key'
      });
    }

    if (action === 'logout') {
      if (sessionId) {
        userSessions.delete(sessionId);
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully logged out' 
      });
    }

    if (action === 'validate') {
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID is required' },
          { status: 400 }
        );
      }

      const session = userSessions.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      if (Date.now() > session.expiresAt) {
        userSessions.delete(sessionId);
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        hasValidSession: true 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = userSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    if (Date.now() > session.expiresAt) {
      userSessions.delete(sessionId);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      hasValidSession: true 
    });

  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 