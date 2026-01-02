import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import createIntlMiddleware from 'next-intl/middleware';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip locale handling for API routes and static files
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/_vercel') ||
    /\..+$/.test(path) // Has file extension
  ) {
    return NextResponse.next();
  }

  // Apply next-intl middleware first
  const intlResponse = intlMiddleware(request);

  // Extract locale from the pathname after intl middleware processing
  const locale = request.nextUrl.pathname.split('/')[1];
  const localePrefix = ['fr', 'en'].includes(locale) ? `/${locale}` : '';

  // Redirect authenticated users from /login or /register to /keys
  const authPaths = [`${localePrefix}/login`, `${localePrefix}/register`, '/login', '/register'];

  if (authPaths.includes(path)) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session) {
      const redirectUrl = localePrefix ? `${localePrefix}/keys` : '/keys';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
