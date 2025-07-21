import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/lib/session-storage';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    console.log('Chat route called with sessionId:', sessionId);
    console.log('Available sessions:', sessionStorage.getAll());
    console.log('Session storage type:', typeof sessionStorage);
    console.log('Session storage methods:', Object.keys(sessionStorage));

    if (!message || !sessionId) {
      console.log('Missing message or sessionId');
      return NextResponse.json(
        { error: 'Message and session ID are required' },
        { status: 400 }
      );
    }

    // Validate session and get user's API key
    const session = sessionStorage.get(sessionId);
    console.log('Found session:', session);
    
    if (!session) {
      console.log('No session found for sessionId:', sessionId);
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      );
    }

    if (Date.now() > session.expiresAt) {
      console.log('Session expired for sessionId:', sessionId);
      sessionStorage.delete(sessionId);
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('Session is valid, proceeding with chat request');

    // Process the message using the user's OpenAI API key
    try {
      console.log('Processing message with OpenAI API');
      
      // Make request to OpenAI API using user's API key
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are project-x, an AI assistant for Fairfield Airport Cars. You help users with:
- Airport car bookings and transportation
- General questions and information
- Customer support and assistance
- Travel planning and recommendations

Be helpful, friendly, and professional. If users ask about bookings, guide them to use the booking system at /book.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        console.log('OpenAI API error:', errorData);
        
        if (openaiResponse.status === 401) {
          return NextResponse.json(
            { error: 'Invalid API key. Please check your OpenAI API key and try again.' },
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to get response from AI service', details: errorData.error?.message || 'Unknown error' },
          { status: openaiResponse.status }
        );
      }

      const data = await openaiResponse.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'I understand your message. How can I help you further?';
      
      console.log('OpenAI response received');
      
      return NextResponse.json({
        response: aiResponse,
        capabilities: ['chat', 'booking', 'information', 'ai-assistant'],
        suggestions: ['Book a ride', 'Get help', 'Ask a question', 'Travel info'],
        source: 'openai-api'
      });

    } catch (error) {
      console.error('Error processing with OpenAI:', error);
      
      // Fallback to web-based responses if OpenAI fails
      console.log('OpenAI failed, using fallback responses');
      
      let response = 'I understand your message. How can I help you further?';
      let suggestions = ['Book a ride', 'Get help', 'Ask a question'];
      
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        response = 'Hello! I\'m project-x, your AI assistant. How can I help you today?';
        suggestions = ['What can you do?', 'Book a ride', 'Get help'];
      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what can you do')) {
        response = 'I can help you with various tasks including:\n• Answering questions\n• Providing information\n• Assisting with bookings\n• General conversation\n\nWhat would you like to know?';
        suggestions = ['Book a ride', 'Get help', 'Ask a question'];
      } else if (message.toLowerCase().includes('booking') || message.toLowerCase().includes('car')) {
        response = 'I can help you with airport car bookings! Would you like to book a ride to or from the airport? You can also use our booking system at /book for a full experience.';
        suggestions = ['Book now', 'Get pricing', 'Contact support'];
      }
      
      return NextResponse.json({
        response: response,
        capabilities: ['chat', 'booking', 'information'],
        suggestions: suggestions,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 