import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage, UserSession } from '@/lib/session-storage';

// Admin users (you and Gregg)
const ADMIN_USERS = [
  'justinpease@gmail.com',
  'gregg@fairfieldairportcars.com'
];

// Shared API key pool for demo purposes
// In production, this would be managed per user with proper billing
const SHARED_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { action, idToken, sessionId } = await request.json();

    if (action === 'login') {
      if (!idToken) {
        return NextResponse.json(
          { error: 'Google ID token is required' },
          { status: 400 }
        );
      }

      // For demo purposes, handle mock token
      let email, userId, name;
      
      if (idToken.startsWith('mock-google-token-')) {
        // Mock authentication for demo
        email = 'justinpease@gmail.com';
        userId = 'mock-user-id-' + Date.now();
        name = 'Justin Pease';
      } else {
        // Real Firebase authentication would go here
        // For now, we'll use mock data
        email = 'justinpease@gmail.com';
        userId = 'mock-user-id-' + Date.now();
        name = 'Justin Pease';
      }

      // Check if user is admin
      const isAdmin = ADMIN_USERS.includes(email || '');

      // Check if user already has a session
      const existingSession = sessionStorage.findByUserId(userId);

      if (existingSession) {
        // Update existing session
        const updatedSession: UserSession = {
          ...existingSession.session,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          isAdmin: isAdmin
        };
        sessionStorage.set(existingSession.sessionId, updatedSession);
        
        return NextResponse.json({
          success: true,
          sessionId: existingSession.sessionId,
          email,
          name,
          isNewUser: false,
          isAdmin,
          message: 'Welcome back!'
        });
      }

      // Create new session with shared API key
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      const newSession: UserSession = {
        userId, 
        email: email || 'user@example.com', 
        apiKey: SHARED_API_KEY || '', 
        expiresAt,
        isNewUser: true,
        isAdmin
      };
      sessionStorage.set(sessionId, newSession);

      return NextResponse.json({
        success: true,
        sessionId,
        email,
        name,
        isNewUser: true,
        isAdmin,
        message: isAdmin 
          ? 'Welcome to project-x! You have admin access.' 
          : 'Welcome to project-x! Your account has been set up with AI capabilities.'
      });
    }

    if (action === 'logout') {
      if (sessionId) {
        sessionStorage.delete(sessionId);
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

      const session = sessionStorage.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      if (Date.now() > session.expiresAt) {
        sessionStorage.delete(sessionId);
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        hasValidSession: true,
        email: session.email,
        isNewUser: session.isNewUser,
        isAdmin: session.isAdmin
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Google auth error:', error);
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

    const session = sessionStorage.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    if (Date.now() > session.expiresAt) {
      sessionStorage.delete(sessionId);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      hasValidSession: true,
      email: session.email,
      isNewUser: session.isNewUser,
      isAdmin: session.isAdmin
    });

  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 