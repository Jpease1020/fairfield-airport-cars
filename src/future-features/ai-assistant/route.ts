import { NextResponse } from 'next/server';
import { getAIAssistantContext, generateAIResponse, generateLocalResponse } from './ai-assistant';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const context = await getAIAssistantContext();
    try {
      const response = await generateAIResponse(message, context);
      return NextResponse.json({ response });
    } catch (error) {
      console.error('AI Assistant OpenAI/local error:', error);
      // Always try local fallback
      try {
        const fallback = await generateLocalResponse(message, context);
        return NextResponse.json({ response: fallback });
      } catch (fallbackError) {
        console.error('AI Assistant fallback error:', fallbackError);
        return NextResponse.json({ 
          error: 'Failed to process request',
          response: "I'm sorry, I'm having trouble right now. Please try again or contact your developer for assistance."
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('AI Assistant route error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      response: "I'm sorry, I'm having trouble right now. Please try again or contact your developer for assistance."
    }, { status: 500 });
  }
} 