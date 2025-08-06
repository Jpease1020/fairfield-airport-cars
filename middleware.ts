import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to check authentication from cookies
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const authCookie = request.cookies.get('auth-token');
  return !!authCookie?.value;
}

// Helper function to check admin status from cookies
async function isAdmin(request: NextRequest): Promise<boolean> {
  const adminCookie = request.cookies.get('admin-token');
  return !!adminCookie?.value;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add pathname to headers for server components
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  
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
      return NextResponse.redirect(new URL('/login', request.url));
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