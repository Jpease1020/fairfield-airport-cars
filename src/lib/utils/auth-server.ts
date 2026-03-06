import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/utils/firebase-admin';
import {
  AUTH_SESSION_COOKIE,
  getCookieValue,
  getSessionFromToken,
  normalizeEmail,
  normalizePhone,
} from '@/lib/utils/auth-session';

export interface AuthContext {
  uid: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  decodedToken: Record<string, any>;
}

const getBearerToken = (request: Request): string | null => {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
};

const getSessionToken = (request: Request): string | null => {
  const cookieHeader = request.headers.get('cookie');
  return getCookieValue(cookieHeader, AUTH_SESSION_COOKIE);
};

export const getAuthContext = async (request: Request): Promise<AuthContext | null> => {
  const token = getBearerToken(request);
  if (token) {
    try {
      const decodedToken = await getAdminAuth().verifyIdToken(token);
      let role: string | null = null;

      try {
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        role = userDoc.exists ? (userDoc.data()?.role ?? null) : null;
      } catch (error) {
        console.error('Failed to load user role:', error);
      }

      return {
        uid: decodedToken.uid,
        email: normalizeEmail(decodedToken.email) ?? null,
        role,
        decodedToken,
      };
    } catch (error) {
      console.error('Auth token verification failed:', error);
    }
  }

  const sessionToken = getSessionToken(request);
  if (!sessionToken) return null;

  try {
    const session = await getSessionFromToken(sessionToken);
    if (!session) return null;

    return {
      uid: session.tokenHash,
      email: session.emailRaw ?? session.email ?? null,
      phone: normalizePhone(session.phone) ?? null,
      role: 'customer',
      decodedToken: {
        method: session.method,
        session: true,
      },
    };
  } catch (error) {
    console.error('Session auth failed:', error);
    return null;
  }
};

export const requireAuth = async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true, auth };
};

export const requireAdmin = async (request: Request) => {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult;
  const auth = authResult.auth;
  if (!auth || auth.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return authResult;
};

const getBookingEmail = (booking: any): string | null => {
  return (
    booking?.customer?.email ||
    booking?.email ||
    booking?.customerEmail ||
    null
  );
};

const getBookingPhone = (booking: any): string | null => {
  return (
    booking?.customer?.phone ||
    booking?.phone ||
    booking?.customerPhone ||
    null
  );
};

export const isBookingOwner = (auth: AuthContext, booking: any): boolean => {
  if (!booking) return false;
  if (booking.customerUserId && booking.customerUserId === auth.uid) return true;

  const bookingEmail = normalizeEmail(getBookingEmail(booking));
  const authEmail = normalizeEmail(auth.email);

  if (bookingEmail && authEmail && bookingEmail === authEmail) {
    return true;
  }

  const bookingPhone = normalizePhone(getBookingPhone(booking));
  const authPhone = normalizePhone(auth.phone);

  if (bookingPhone && authPhone && bookingPhone === authPhone) {
    return true;
  }

  return false;
};

export const requireOwnerOrAdmin = async (request: Request, booking: any) => {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult;
  const auth = authResult.auth;
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  if (auth.role === 'admin') {
    return authResult;
  }

  if (!isBookingOwner(auth, booking)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return authResult;
};

export const hasTrackingAccess = (request: Request, booking: any): boolean => {
  const token = new URL(request.url).searchParams.get('token');
  return Boolean(token && booking?.trackingToken && token === booking.trackingToken);
};

export const requireOwnerAdminOrTrackingToken = async (request: Request, booking: any) => {
  if (hasTrackingAccess(request, booking)) {
    return {
      ok: true as const,
      auth: null,
      access: 'tracking-token' as const,
    };
  }

  const authResult = await requireOwnerOrAdmin(request, booking);
  if (!authResult.ok) return authResult;

  return {
    ok: true as const,
    auth: authResult.auth,
    access: authResult.auth?.role === 'admin' ? ('admin' as const) : ('owner' as const),
  };
};
