import Stripe from "stripe";
import { db } from "@/lib/db";
import { premiumUsers, stripeEvents, wallets, organisations, organisationMembers } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";

// IMPORTANT : Node runtime (Edge incompatible avec constructEvent)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Récupérer RAW body (CRITIQUE pour signature)
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("⚠️ No Stripe signature in headers");
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Vérifier signature Stripe (CRITIQUE)
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    console.error("⚠️ Webhook signature verification failed:", err);
    return new Response("Unauthorized", { status: 401 });
  }

  // 3. Logger événement (audit trail)
  try {
    await db.insert(stripeEvents).values({
      id: crypto.randomUUID(),
      eventId: event.id,
      type: event.type,
      payload: event.data.object,
      receivedAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to log Stripe event:", err);
    // Continue quand même (pas bloquant)
  }

  // 4. Traiter événements Stripe

  // Handle ONE-TIME PAYMENT (credit purchase)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Distinguish between one-time payment and subscription
    if (session.mode === "payment") {
      await handleCreditPurchase(session);
    } else if (session.mode === "subscription") {
      // Legacy subscription flow (kept for backwards compatibility)
      console.log("⚠️ Subscription checkout detected (legacy mode)");
    }
  }

  // Handle SUBSCRIPTION events (legacy, kept for backwards compatibility)
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionCreated(subscription);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionUpdated(subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionDeleted(subscription);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    await handlePaymentFailed(invoice);
  }

  // 5. TOUJOURS retourner 200 (même si erreur business)
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Handle credit purchase (one-time payment)
async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const creditAmount = parseInt(session.metadata?.creditAmount || "0");
  const planType = session.metadata?.planType;
  const planName = session.metadata?.planName;

  if (!userId || !creditAmount) {
    console.error("❌ Missing metadata in checkout session:", {
      userId,
      creditAmount,
      sessionId: session.id,
    });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Find user's organization (or create one)
      const userOrg = await tx
        .select({ orgId: organisationMembers.orgId })
        .from(organisationMembers)
        .where(eq(organisationMembers.userId, userId))
        .limit(1);

      let orgId: string;

      if (userOrg.length === 0) {
        // Create a personal organization for the user
        const newOrgId = `org_${userId}_${Date.now()}`;

        await tx.insert(organisations).values({
          id: newOrgId,
          name: `Personal Workspace`,
          slug: `personal-${userId.slice(0, 8)}-${Date.now()}`,
          ownerId: userId,
        });

        await tx.insert(organisationMembers).values({
          id: `om_${newOrgId}_${Date.now()}`,
          orgId: newOrgId,
          userId: userId,
          role: "owner",
        });

        orgId = newOrgId;
        console.log(`✅ Created new organization: ${orgId} for user ${userId}`);
      } else {
        orgId = userOrg[0].orgId;
      }

      // 2. Check if wallet exists for the organization
      const existingWallet = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.orgId, orgId))
        .limit(1);

      if (existingWallet.length === 0) {
        // Create wallet with initial credits
        await tx.insert(wallets).values({
          id: `wallet_${orgId}_${Date.now()}`,
          orgId: orgId,
          balance: creditAmount,
          totalPurchased: creditAmount,
          totalUsed: 0,
          currency: "EUR",
        });

        console.log(`✅ Created wallet with ${creditAmount} credits for org ${orgId}`);
      } else {
        // Update existing wallet
        await tx
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${creditAmount}`,
            totalPurchased: sql`${wallets.totalPurchased} + ${creditAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(wallets.orgId, orgId));

        console.log(`✅ Added ${creditAmount} credits to existing wallet for org ${orgId}`);
      }

      // 3. Mark event as processed
      await tx
        .update(stripeEvents)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(stripeEvents.eventId, session.id));
    });

    console.log(
      JSON.stringify({
        event: "credit.purchase",
        userId,
        creditAmount,
        planType,
        planName,
        sessionId: session.id,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("❌ Failed to process credit purchase:", err);
  }
}

// Handle subscription created (user just subscribed)
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  if (!userId) {
    console.error(
      "❌ Missing userId in subscription metadata:",
      subscriptionId,
    );
    return;
  }

  // Idempotence check
  const existing = await db
    .select()
    .from(premiumUsers)
    .where(eq(premiumUsers.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (existing.length > 0) {
    console.log("✅ Subscription already processed (idempotent)");
    return;
  }

  // Extract and validate current_period_end
  const currentPeriodEndTimestamp = (subscription as any).current_period_end;
  let currentPeriodEnd: Date;

  if (
    currentPeriodEndTimestamp &&
    typeof currentPeriodEndTimestamp === "number"
  ) {
    currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000);
  } else {
    // Fallback: set to 30 days from now if not available
    console.warn(
      "⚠️ current_period_end not available, using fallback (30 days)",
    );
    currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Insert premium user
  try {
    await db.transaction(async (tx) => {
      await tx.insert(premiumUsers).values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPeriodEnd,
        upgradedAt: new Date(),
      });

      await tx
        .update(stripeEvents)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(stripeEvents.eventId, subscription.id));
    });

    console.log(
      JSON.stringify({
        event: "subscription.created",
        userId,
        subscriptionId,
        status: subscription.status,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error("❌ Failed to create premium subscription:", err);
  }
}

// Handle subscription updated (status change, renewal, etc.)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  try {
    const updated = await db
      .update(premiumUsers)
      .set({
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
        canceledAt: (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000)
          : null,
      })
      .where(eq(premiumUsers.stripeSubscriptionId, subscriptionId))
      .returning();

    if (updated.length === 0) {
      console.warn(
        "⚠️ Subscription updated but not found in DB:",
        subscriptionId,
      );
      return;
    }

    console.log(
      JSON.stringify({
        event: "subscription.updated",
        subscriptionId,
        status: subscription.status,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error("❌ Failed to update subscription:", err);
  }
}

// Handle subscription deleted (canceled and period ended)
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  try {
    const deleted = await db
      .delete(premiumUsers)
      .where(eq(premiumUsers.stripeSubscriptionId, subscriptionId))
      .returning();

    if (deleted.length === 0) {
      console.warn(
        "⚠️ Subscription deleted but not found in DB:",
        subscriptionId,
      );
      return;
    }

    console.log(
      JSON.stringify({
        event: "subscription.deleted",
        subscriptionId,
        userId: deleted[0].userId,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error("❌ Failed to delete subscription:", err);
  }
}

// Handle payment failed (subscription past_due)
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    console.warn(
      "⚠️ Payment failed for invoice without subscription:",
      invoice.id,
    );
    return;
  }

  try {
    await db
      .update(premiumUsers)
      .set({ subscriptionStatus: "past_due" })
      .where(eq(premiumUsers.stripeSubscriptionId, subscriptionId));

    console.log(
      JSON.stringify({
        event: "payment.failed",
        subscriptionId,
        invoiceId: invoice.id,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error("❌ Failed to mark subscription as past_due:", err);
  }
}
