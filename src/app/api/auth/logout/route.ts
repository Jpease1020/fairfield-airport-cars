import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import {
  AUTH_SESSION_COOKIE,
  clearSessionCookie,
  getCookieValue,
  hmacToken,
} from '@/lib/utils/auth-session';

// The "Logout" buttons in AdminNavigation/CustomerNavigation only called Firebase client auth's
// signOut(), which is entirely separate from this app's own booking_session cookie set by the
// OTP/magic-link flow — clicking "Logout" never actually cleared it, leaving the session valid
// server-side for up to 30 days regardless (a real problem on a shared/public computer, or if a
// session token ever leaked). Deletes the session record itself, not just the browser cookie, so
// a copy of the token elsewhere is also immediately invalidated.
export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getCookieValue(cookieHeader, AUTH_SESSION_COOKIE);

  if (token) {
    try {
      const tokenHash = hmacToken(token);
      await getAdminDb().collection('authSessions').doc(tokenHash).delete();
    } catch (error) {
      console.error('Failed to delete session record on logout:', error);
    }
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
