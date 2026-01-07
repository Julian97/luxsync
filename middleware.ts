import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For API routes, we'll check authentication in the route handlers themselves
    // For page routes, we'll check if the user is authenticated via cookies/sessions
    // In a real application, you'd implement proper session management
    
    // For now, we'll allow access but in a real app you'd check for session tokens
    const url = request.nextUrl.clone();
    
    // If trying to access admin without proper auth, redirect to login
    // This is a simplified check - in reality you'd verify session tokens
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin')) {
      // Allow the request to continue, authentication will be handled in the page/route
    }
  }
  
  return NextResponse.next();
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