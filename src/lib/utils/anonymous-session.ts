// Simple anonymous session management for quote storage
// Uses sessionStorage for ephemeral storage (clears on tab close)

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create anonymous session (sessionStorage only)
export const getOrCreateAnonymousSession = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: generate new session
    return generateSessionId();
  }

  // Client-side: check sessionStorage first
  const storedSessionId = sessionStorage.getItem('fairfield_quote_session');
  
  if (storedSessionId) {
    return storedSessionId;
  }

  // Create new session
  const sessionId = generateSessionId();
  sessionStorage.setItem('fairfield_quote_session', sessionId);
  return sessionId;
};

// Clear anonymous session
export const clearAnonymousSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('fairfield_quote_session');
  }
};

// Check if session exists (simple check)
export const hasAnonymousSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem('fairfield_quote_session');
};
