import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ENFORCE_COOKIE_AUTH = process.env.ENFORCE_COOKIE_AUTH === 'true';

// Helper function to check authentication from cookies (optional)
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  if (!ENFORCE_COOKIE_AUTH) return true;
  const authCookie = request.cookies.get('auth-token');
  return !!authCookie?.value;
}

// Helper function to check admin status from cookies (optional)
async function isAdmin(request: NextRequest): Promise<boolean> {
  if (!ENFORCE_COOKIE_AUTH) return true;
  const adminCookie = request.cookies.get('admin-token');
  return !!adminCookie?.value;
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
  } else {
    // In production, add cache-busting with short cache times for HTML pages
    // This ensures users get updates quickly while still benefiting from caching
    if (!pathname.startsWith('/api/') && !pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2)$/)) {
      // HTML pages: 1 minute cache with revalidation
      // This allows fast updates while still providing performance benefits
      response.headers.set('Cache-Control', 'public, max-age=60, must-revalidate, stale-while-revalidate=120');
      
      // Add version header for cache-busting
      const buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'latest';
      response.headers.set('X-Build-Version', buildId);
    }
    
    // API routes: no cache
    if (pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
  }
  
  // Admin routes - STRICT protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/(admin)')) {
    const isAdminUser = await isAdmin(request);
    
    if (!isAdminUser) {
      // Redirect non-admin users away from admin routes
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow admin users to proceed
    return response;
  }
  
  // Customer routes - authentication required
  if (pathname.startsWith('/book') || 
      pathname.startsWith('/bookings') || 
      pathname.startsWith('/tracking') ||
      pathname.startsWith('/status') ||
      pathname.startsWith('/booking') ||
      pathname.startsWith('/manage') ||
      pathname.startsWith('/feedback') ||
      pathname.startsWith('/payments') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/(customer)')) {
    
    const isAuthenticatedUser = await isAuthenticated(request);
    
    if (!isAuthenticatedUser) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Allow authenticated users to proceed
    return response;
  }
  
  // Public routes - no protection needed
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
