import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, deviceTokensTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

const RegisterTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]).default("ios"),
});

// POST /api/notifications/register — Register a device push token
router.post("/notifications/register", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = RegisterTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues.map(i => i.message).join("; ") });
      return;
    }

    const { token, platform } = parsed.data;

    await db.insert(deviceTokensTable).values({
      userId: req.userId!,
      token,
      platform,
      environment: "sandbox",
    }).onConflictDoNothing();

    logger.info({ userId: req.userId!, platform }, "Device token registered");
    res.json({ registered: true });
  } catch (err) {
    logger.error({ err }, "Failed to register device token");
    res.status(500).json({ error: "Failed to register device token" });
  }
});

// DELETE /api/notifications/register — Unregister a device push token
router.delete("/notifications/register", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ error: "token is required" });
      return;
    }

    await db.delete(deviceTokensTable)
      .where(eq(deviceTokensTable.token, token));

    logger.info({ userId: req.userId! }, "Device token removed");
    res.json({ removed: true });
  } catch (err) {
    logger.error({ err }, "Failed to remove device token");
    res.status(500).json({ error: "Failed to remove device token" });
  }
});

export default router;
