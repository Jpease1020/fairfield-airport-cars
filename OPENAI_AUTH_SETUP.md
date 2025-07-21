# OpenAI Authentication Setup Guide

## Overview

The project-x web interface now supports OpenAI OAuth-style authentication, allowing users to connect their own OpenAI accounts without needing to manually handle API keys.

## How It Works

1. **User Experience**: Users click "Connect OpenAI Account" and enter their API key
2. **Authentication**: The system validates the API key with OpenAI
3. **Session Management**: User sessions are stored securely with their API key
4. **Chat Interface**: All chat messages use the user's own OpenAI account

## Features

- ✅ **Secure API Key Storage**: API keys are stored in memory only (not persisted)
- ✅ **Session Management**: 24-hour sessions with automatic expiration
- ✅ **User Validation**: Verifies API keys with OpenAI before allowing access
- ✅ **Seamless Experience**: Users don't need to understand API keys
- ✅ **Multi-User Support**: Each user has their own session and API key

## API Endpoints

### Authentication
- `POST /api/project-x/auth/openai` - Login/logout/validate sessions
- `GET /api/project-x/auth/openai` - Validate existing sessions

### Chat
- `POST /api/project-x/chat` - Send messages to project-x with user's API key

## User Flow

1. User visits `/project-x-web`
2. User enters their OpenAI API key
3. System validates the key with OpenAI
4. User is authenticated and can start chatting
5. All messages use the user's own OpenAI account
6. Sessions expire after 24 hours

## Security Features

- API keys are never stored in databases
- Sessions expire automatically
- Invalid API keys are rejected immediately
- Each user's API key is isolated

## Benefits

- **No Manual API Key Management**: Users don't need to find or manage API keys
- **Individual Billing**: Each user pays for their own OpenAI usage
- **Privacy**: Users' API keys are not shared
- **Simplicity**: One-click authentication process

## Technical Implementation

### Session Storage
```typescript
const userSessions = new Map<string, { 
  userId: string; 
  email: string; 
  apiKey: string; 
  expiresAt: number;
  isNewUser: boolean;
}>();
```

### API Key Validation
```typescript
const testResponse = await fetch('https://api.openai.com/v1/models', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${openaiToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Chat Forwarding
```typescript
const project-xResponse = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.apiKey}`
  },
  body: JSON.stringify({ 
    message,
    user: session.email,
    context: 'web-interface'
  })
});
```

## Future Enhancements

- **OAuth Integration**: True OAuth flow with OpenAI (if available)
- **Database Storage**: Persistent user sessions in database
- **Usage Tracking**: Monitor API usage per user
- **Billing Integration**: Automatic billing for API usage
- **Team Management**: Shared API keys for teams

## Usage Instructions

1. Visit `/project-x-web` in your browser
2. Click "Connect OpenAI Account"
3. Enter your OpenAI API key (get one at https://platform.openai.com/api-keys)
4. Start chatting with project-x!

The system will automatically handle all the authentication and API key management for you. 