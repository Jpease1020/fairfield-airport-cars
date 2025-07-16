// Shared session storage for all Jarvis authentication and chat routes
export interface UserSession {
  userId: string;
  email: string;
  apiKey: string;
  expiresAt: number;
  isNewUser: boolean;
  isAdmin?: boolean;
}

// Global in-memory storage for user sessions
// This persists across server restarts in development
declare global {
  var __userSessions: Map<string, UserSession> | undefined;
}

if (!global.__userSessions) {
  global.__userSessions = new Map<string, UserSession>();
}

const userSessions = global.__userSessions;

export const sessionStorage = {
  // Set a session
  set: (sessionId: string, session: UserSession) => {
    console.log('Setting session:', sessionId, 'for user:', session.email);
    userSessions.set(sessionId, session);
    console.log('Total sessions after set:', userSessions.size);
  },

  // Get a session
  get: (sessionId: string): UserSession | undefined => {
    const session = userSessions.get(sessionId);
    console.log('Getting session:', sessionId, 'found:', !!session);
    return session;
  },

  // Delete a session
  delete: (sessionId: string) => {
    userSessions.delete(sessionId);
  },

  // Check if session exists and is valid
  isValid: (sessionId: string): boolean => {
    const session = userSessions.get(sessionId);
    if (!session) return false;
    
    if (Date.now() > session.expiresAt) {
      userSessions.delete(sessionId);
      return false;
    }
    
    return true;
  },

  // Get all sessions (for debugging)
  getAll: () => {
    return Array.from(userSessions.entries());
  },

  // Find session by user ID
  findByUserId: (userId: string): { sessionId: string; session: UserSession } | null => {
    for (const [sessionId, session] of userSessions.entries()) {
      if (session.userId === userId) {
        return { sessionId, session };
      }
    }
    return null;
  }
}; 