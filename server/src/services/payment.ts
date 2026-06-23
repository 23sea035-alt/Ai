import { db, usersTable, subscriptionsTable } from "../db/src/index.js";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

// ── Stripe client (lazy init) ──────────────────────────────────────────
let _stripe: any = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is required for payments");
    }
    const Stripe = require("stripe");
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}

const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID ?? "price_premium_monthly";

// ── Create Stripe Checkout session ─────────────────────────────────────
export async function createCheckoutSession(
  userId: number,
  userEmail: string,
): Promise<{ url: string | null; sessionId: string }> {
  const stripe = getStripe();

  // Get or create Stripe customer
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId: String(userId) },
    });
    customerId = customer.id;
    await db.update(usersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(usersTable.id, userId));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.APP_URL ?? "http://localhost:8081"}/premium/success`,
    cancel_url: `${process.env.APP_URL ?? "http://localhost:8081"}/premium`,
    metadata: { userId: String(userId) },
  });

  return { url: session.url, sessionId: session.id };
}

// ── Handle Stripe webhook ──────────────────────────────────────────────
export async function handleWebhook(
  rawBody: string,
  signature: string,
): Promise<{ received: boolean }> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    logger.error({ err: err.message }, "Webhook signature verification failed");
    throw new Error("Webhook signature verification failed");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = Number(session.metadata.userId);
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (userId) {
        await db.insert(subscriptionsTable).values({
          userId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          tier: "premium",
          status: "active",
          currentPeriodEnd: new Date(session.expires_at * 1000),
        }).onConflictDoUpdate({
          target: subscriptionsTable.userId,
          set: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            tier: "premium",
            status: "active",
            currentPeriodEnd: new Date(session.expires_at * 1000),
          },
        });

        await db.update(usersTable)
          .set({ isPremium: true })
          .where(eq(usersTable.id, userId));
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const subCustomerId = subscription.customer;
      const status = subscription.status;

      // Find user by stripeCustomerId
      const [subUser] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.stripeCustomerId!, subCustomerId))
        .limit(1);

      if (subUser) {
        const isActive = status === "active" || status === "trialing";
        await db.update(subscriptionsTable)
          .set({
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(subscriptionsTable.userId, subUser.id));

        if (!isActive) {
          await db.update(usersTable)
            .set({ isPremium: false })
            .where(eq(usersTable.id, subUser.id));
        }
      }
      break;
    }
  }

  return { received: true };
}
