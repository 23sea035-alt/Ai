import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { createCheckoutSession, handleWebhook } from "../services/payment.js";

const router = Router();

// POST /api/payments/create-checkout-session
router.post("/payments/create-checkout-session", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const { url, sessionId } = await createCheckoutSession(req.userId!, user.email);
    res.json({ url, sessionId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed to create checkout session" });
  }
});

// POST /api/payments/webhook — Stripe webhook (raw body needed)
router.post("/payments/webhook", async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) { res.status(400).json({ error: "Missing stripe-signature header" }); return; }

    const rawBody = (req as any).rawBody ?? JSON.stringify(req.body);
    const result = await handleWebhook(rawBody, signature);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err?.message ?? "Webhook error" });
  }
});

export default router;
