import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting EMAIL (distinct from API rate limiting)
export const emailRateLimitPerUser = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '24 h'), // 3 emails/24h per user
  analytics: true,
  prefix: 'ratelimit:email:user',
});

export const emailRateLimitGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, '24 h'), // 80 emails/day global (Resend free tier)
  analytics: true,
  prefix: 'ratelimit:email:global',
});

export async function checkEmailRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  // Check user limit
  const userLimit = await emailRateLimitPerUser.limit(identifier);
  if (!userLimit.success) {
    return userLimit;
  }

  // Check global limit
  const globalLimit = await emailRateLimitGlobal.limit('global');
  if (!globalLimit.success) {
    return globalLimit;
  }

  return userLimit;
}
