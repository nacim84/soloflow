import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('admin-token'); // Check for token in cookies
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access a protected route
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Match all paths except API routes, static files, and favicon
};