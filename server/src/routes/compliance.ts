import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, messagesTable, companionsTable, memoriesTable, deviceTokensTable, safetyEventsTable, bannedIdentitiesTable } from "../db/src/index.js";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logger } from "../lib/logger.js";
import { hashIdentifier } from "../lib/crypto.js";
import { sendSuccess, sendError } from "../lib/response.js";
import { ReportMessageSchema, BanUserSchema, UnbanUserSchema } from "@aura/shared";

const router = Router();

// DELETE /api/account — Soft-delete account (30-day grace, recoverable)
router.delete("/account", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    await db.transaction(async (tx) => {
      await tx.delete(deviceTokensTable).where(eq(deviceTokensTable.userId, userId));
      await tx.update(usersTable).set({
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        ageVerified: false,
        email: `deleted-${userId}@aura.ai`,
        status: "deleted",
        deletedAt: new Date(),
        isPremium: false,
        updatedAt: new Date(),
      }).where(eq(usersTable.id, userId));
    });

    logger.info({ userId }, "Account soft-deleted — 30-day grace period started");
    sendSuccess(res, { deleted: true, gracePeriodDays: 30 });
  } catch (err) {
    logger.error({ err }, "Account deletion failed");
    sendError(res, "Account deletion failed", 500);
  }
});

// PATCH /api/account/reactivate — Restore soft-deleted account within grace period
router.patch("/account/reactivate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || user.status !== "deleted") {
      sendError(res, "Account is not deleted", 400);
      return;
    }

    await db.update(usersTable).set({
      status: "active",
      deletedAt: null,
      email: `reactivated-${userId}@aura.ai`,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    logger.info({ userId }, "Account reactivated");
    sendSuccess(res, { reactivated: true });
  } catch (err) {
    logger.error({ err }, "Account reactivation failed");
    sendError(res, "Account reactivation failed", 500);
  }
});

// GET /api/account/export — Data export (GDPR)
router.get("/account/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const allCompanions = await db.select().from(companionsTable).where(eq(companionsTable.userId, userId));
    const allMessages = await db.select().from(messagesTable).where(eq(messagesTable.userId, userId));
    const allMemories = await db.select().from(memoriesTable).where(eq(memoriesTable.userId, userId));

    sendSuccess(res, { user, companions: allCompanions, messages: allMessages, memories: allMemories });
  } catch (err) {
    logger.error({ err }, "Data export failed");
    sendError(res, "Data export failed", 500);
  }
});

// POST /api/messages/:id/report — Flag an AI message (Apple Guideline 1.2 / UGC)
router.post("/messages/:id/report", requireAuth, validate(ReportMessageSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const messageId = req.params.id as string;
    const { reason, detail } = req.body;

    const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
    if (!message) {
      sendError(res, "Message not found", 404);
      return;
    }

    await db.insert(safetyEventsTable).values({
      userId,
      messageId,
      eventType: "user_reported",
      source: "user_report",
      detail: reason,
      flaggedContent: detail ?? null,
    });

    logger.info({ userId, messageId }, "Message reported");
    sendSuccess(res, { reported: true }, 201);
  } catch (err) {
    logger.error({ err }, "Failed to report message");
    sendError(res, "Failed to report message", 500);
  }
});

// GET /api/admin/safety-events — Review safety events queue (admin only)
router.get("/admin/safety-events", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const events = await db.select().from(safetyEventsTable).orderBy(desc(safetyEventsTable.createdAt)).limit(50);

    sendSuccess(res, events);
  } catch (err) {
    logger.error({ err }, "Failed to fetch safety events");
    sendError(res, "Failed to fetch safety events", 500);
  }
});

// POST /api/admin/ban — Ban a user by email (admin only)
router.post("/admin/ban", requireAuth, requireAdmin, validate(BanUserSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { email, reason } = req.body;

    await db.insert(bannedIdentitiesTable).values({
      identifierHash: hashIdentifier(email.toLowerCase()),
      identifierType: "email",
      reason: reason ?? "Violation of terms",
    });

    logger.info({ adminId: userId, bannedEmail: email }, "User banned");
    sendSuccess(res, { banned: true }, 201);
  } catch (err) {
    logger.error({ err }, "Ban failed");
    sendError(res, "Ban failed", 500);
  }
});

// POST /api/admin/unban — Unban a user by email (admin only)
router.post("/admin/unban", requireAuth, requireAdmin, validate(UnbanUserSchema), async (req: AuthRequest, res) => {
  try {
    const { email } = req.body;

    const hash = hashIdentifier(email.toLowerCase());
    await db.delete(bannedIdentitiesTable).where(eq(bannedIdentitiesTable.identifierHash, hash));

    logger.info({ adminId: req.userId!, unbannedEmail: email }, "User unbanned");
    sendSuccess(res, { unbanned: true });
  } catch (err) {
    logger.error({ err }, "Unban failed");
    sendError(res, "Unban failed", 500);
  }
});

export default router;
