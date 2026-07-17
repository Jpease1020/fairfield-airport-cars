import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route gating for admin/customer pages lives in the real auth system (client-side Firebase
// auth + per-route API checks like requireAdmin/requireAuth/requireOwnerOrAdmin), not here.
// This file previously had a second, parallel "gate" that checked for `admin-token`/`auth-token`
// cookies — cookies the app has never actually set anywhere (the real session cookie is
// `booking_session`, see src/lib/utils/auth-session.ts) — guarded behind an ENFORCE_COOKIE_AUTH
// env var that was never set in Vercel either. That code always no-op'd and was removed rather
// than fixed: it read as protection that didn't exist.
function isGatedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/book') || // also covers /books, /booking, /booking/[id], etc.
    pathname.startsWith('/status') ||
    pathname.startsWith('/manage') ||
    pathname.startsWith('/feedback') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/payment-success') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/cancel') ||
    pathname.startsWith('/find-booking') ||
    pathname.startsWith('/success')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add pathname to headers for server components
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  // NEVER cache service worker file - always fetch fresh version
  if (pathname === '/sw.js' || pathname.startsWith('/sw.js')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    // Add version header for tracking
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString();
    response.headers.set('X-SW-Version', buildId);
    return response;
  }

  // Disable all caching in development for hot reloading
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  } else if (pathname.startsWith('/api/')) {
    // API routes: no cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else if (isGatedPath(pathname)) {
    // Admin and customer-authenticated pages: never shared-cache these, even though nothing
    // here blocks the request — a `public` Cache-Control on personalized/admin content means a
    // CDN or shared proxy could serve one user's page to another within the cache window.
    response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
  } else if (!pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2)$/)) {
    // Everything else (genuinely public marketing/legal pages): short public cache is fine.
    response.headers.set('Cache-Control', 'public, max-age=60, must-revalidate, stale-while-revalidate=120');

    // Add version header for cache-busting
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'latest';
    response.headers.set('X-Build-Version', buildId);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
