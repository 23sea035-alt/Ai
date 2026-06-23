import { Router } from "express";
import { logger } from "../lib/logger.js";
import { handleRevenueCatWebhook } from "../services/payments/revenuecat.js";

const router = Router();

// POST /api/payments/webhook — RevenueCat webhook
router.post("/payments/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-revenuecat-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing x-revenuecat-signature header" });
      return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      res.status(400).json({ error: "Missing raw body" });
      return;
    }
    const result = await handleRevenueCatWebhook(rawBody, signature);
    res.json(result);
  } catch (err: any) {
    logger.error({ err }, "RevenueCat webhook error");
    res.status(400).json({ error: err?.message ?? "Webhook error" });
  }
});

export default router;
