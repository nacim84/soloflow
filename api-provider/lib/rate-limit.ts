import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// IMPORTANT : Nécessite variables d'environnement
// UPSTASH_REDIS_REST_URL=...
// UPSTASH_REDIS_REST_TOKEN=...

// Si variables manquantes, fallback no-op (dev mode)
let authRateLimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  authRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 tentatives / 15 min
    prefix: 'auth_rate_limit',
  });
}

export async function checkAuthRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  if (!authRateLimit) {
    // Dev mode sans Upstash : toujours allow
    return { success: true, remaining: 999, reset: 0 };
  }

  const { success, remaining, reset } = await authRateLimit.limit(identifier);

  return { success, remaining, reset };
}
