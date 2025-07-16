import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage, UserSession } from '@/lib/session-storage';

export async function POST(request: NextRequest) {
  try {
    const { action, openaiToken, sessionId } = await request.json();

    if (action === 'login') {
      if (!openaiToken) {
        return NextResponse.json(
          { error: 'OpenAI token is required' },
          { status: 400 }
        );
      }

      // Verify the OpenAI token by making a test API call
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 401 }
        );
      }

      // Get user info from OpenAI (if available)
      let userEmail = 'user@openai.com'; // Default fallback
      let userId = openaiToken.substring(0, 8); // Use first 8 chars as user ID

      try {
        // Try to get user info from OpenAI (this might not be available in all cases)
        const userResponse = await fetch('https://api.openai.com/v1/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userEmail = userData.email || userEmail;
          userId = userData.id || userId;
        }
      } catch (error) {
        console.log('Could not fetch user info from OpenAI, using fallback');
      }

      // Check if user already has a session
      const existingSession = sessionStorage.findByUserId(userId);

      if (existingSession) {
        // Update existing session with new API key
        existingSession.session.apiKey = openaiToken;
        existingSession.session.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.set(existingSession.sessionId, existingSession.session);
        
        console.log('Updated existing session:', { sessionId: existingSession.sessionId, email: userEmail });
        console.log('All sessions after update:', sessionStorage.getAll());
        
        return NextResponse.json({
          success: true,
          sessionId: existingSession.sessionId,
          email: userEmail,
          isNewUser: false,
          message: 'Welcome back! Your OpenAI account is connected.'
        });
      }

      // Create new session
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      const newSession: UserSession = {
        userId, 
        email: userEmail, 
        apiKey: openaiToken, 
        expiresAt,
        isNewUser: true
      };
      sessionStorage.set(sessionId, newSession);
      
      console.log('Created new session:', { sessionId, email: userEmail });
      console.log('All sessions after creation:', sessionStorage.getAll());
      console.log('Session storage type:', typeof sessionStorage);
      console.log('Session storage methods:', Object.keys(sessionStorage));

      return NextResponse.json({
        success: true,
        sessionId,
        email: userEmail,
        isNewUser: true,
        message: 'Welcome to Jarvis! Your OpenAI account has been connected successfully.'
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
        isNewUser: session.isNewUser
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('OpenAI auth error:', error);
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
      isNewUser: session.isNewUser
    });

  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 