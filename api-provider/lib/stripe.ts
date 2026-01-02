import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe instance (lazy initialization)
 * Prevents build errors when env vars are not available
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover' as any,
    });
  }
  return stripeInstance;
}
