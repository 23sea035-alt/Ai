import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, deviceTokensTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import { sendSuccess, sendError } from "../lib/response.js";

const router = Router();

const RegisterTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]).default("ios"),
});

router.post("/notifications/register", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = RegisterTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.issues.map(i => i.message).join("; "), 400);
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
    sendSuccess(res, { registered: true }, 201);
  } catch (err) {
    logger.error({ err }, "Failed to register device token");
    sendError(res, "Failed to register device token", 500);
  }
});

router.delete("/notifications/register", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      sendError(res, "token is required", 400);
      return;
    }

    await db.delete(deviceTokensTable)
      .where(eq(deviceTokensTable.token, token));

    logger.info({ userId: req.userId! }, "Device token removed");
    sendSuccess(res, { removed: true });
  } catch (err) {
    logger.error({ err }, "Failed to remove device token");
    sendError(res, "Failed to remove device token", 500);
  }
});

export default router;
