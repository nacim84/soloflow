import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { checkAuthRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

// Wrapper pour ajouter rate limiting
export async function GET(request: NextRequest) {
  return withRateLimit(request, handler.GET);
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handler.POST);
}

async function withRateLimit(
  request: NextRequest,
  handlerFn: (req: NextRequest) => Promise<Response>
) {
  // En développement, ignorer le rate limiting (Upstash peut causer des problèmes)
  if (process.env.NODE_ENV === 'development') {
    return handlerFn(request);
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success, reset } = await checkAuthRateLimit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.floor((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.floor((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return handlerFn(request);
}
