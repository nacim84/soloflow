import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";

// Credit plan configurations
const CREDIT_PLANS = {
  developer: {
    priceId: process.env.STRIPE_PRICE_DEVELOPPER_PLAN!,
    credits: 1000,
    name: "Developer Pack",
  },
  startup: {
    priceId: process.env.STRIPE_PRICE_STARTUP_PACK_PLAN!,
    credits: 5000,
    name: "Startup Pack",
  },
  scale: {
    priceId: process.env.STRIPE_PRICE_SCALE_PLANE!,
    credits: 25000,
    name: "Scale Pack",
  },
} as const;

export async function POST(req: Request) {
  // Validation production (éviter sk_test_ en prod)
  if (
    process.env.NODE_ENV === "production" &&
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
  ) {
    console.error("🔴 CRITICAL: Test Stripe key in production!");
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      status: 500,
    });
  }

  // 1. Authentification
  const session = await auth.api.getSession({ headers: await headers() });

  // TODO: P0 - Add rate limiting to prevent checkout spam
  // Implement: checkCheckoutRateLimit(`checkout:${session.user.id}`)
  // Limit: 5 attempts / 15 min per user
  // See: lib/rate-limit.ts (Upstash Redis already configured)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 2. Parse and validate planType
  let planType: 'developer' | 'startup' | 'scale';
  try {
    const body = await req.json();
    planType = body.planType;

    if (!planType || !['developer', 'startup', 'scale'].includes(planType)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan type. Must be 'developer', 'startup' or 'scale'" }),
        { status: 400 }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400 }
    );
  }

  // 3. Get plan configuration
  const plan = CREDIT_PLANS[planType];

  // 4. Créer Checkout Session (ONE-TIME PAYMENT MODE)
  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment for credits
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/keys?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`, // Return to homepage
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        planType: planType,
        creditAmount: plan.credits.toString(),
        planName: plan.name,
      },
      // EU Compliance
      automatic_tax: { enabled: true },
      consent_collection: {
        terms_of_service: "required",
      },
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Stripe checkout creation failed:", err);
    return new Response(
      JSON.stringify({ error: "Payment initialization failed" }),
      { status: 500 },
    );
  }
}
