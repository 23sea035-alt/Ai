import { Router } from "express";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { db, usersTable, messagesTable, companionsTable, memoriesTable, subscriptionsTable, deviceTokensTable, memoryJobsTable, bannedIdentitiesTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import { hashIdentifier } from "../lib/crypto.js";

const router = Router();

// DELETE /api/account — Full account deletion
router.delete("/account", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    await db.transaction(async (tx) => {
      await tx.delete(memoryJobsTable).where(eq(memoryJobsTable.userId, userId));
      await tx.delete(deviceTokensTable).where(eq(deviceTokensTable.userId, userId));
      await tx.delete(messagesTable).where(eq(messagesTable.userId, userId));
      await tx.delete(memoriesTable).where(eq(memoriesTable.userId, userId));
      await tx.delete(companionsTable).where(eq(companionsTable.userId, userId));
      await tx.delete(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
      await tx.delete(usersTable).where(eq(usersTable.id, userId));
    });

    logger.info({ userId }, "Account fully deleted");
    res.json({ deleted: true });
  } catch (err) {
    logger.error({ err }, "Account deletion failed");
    res.status(500).json({ error: "Account deletion failed" });
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
    const [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      companions: allCompanions,
      messages: allMessages,
      memories: allMemories,
      subscription: subscription ?? null,
    };

    res.json(exportData);
  } catch (err) {
    logger.error({ err }, "Data export failed");
    res.status(500).json({ error: "Data export failed" });
  }
});

// GET /api/admin/safety-events — Safety events review queue (admin)
router.get("/admin/safety-events", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user?.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { safetyEventsTable } = await import("../db/src/index.js");

    const events = await db
      .select()
      .from(safetyEventsTable)
      .orderBy(desc(safetyEventsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ events, page, limit });
  } catch (err) {
    logger.error({ err }, "Failed to fetch safety events");
    res.status(500).json({ error: "Failed to fetch safety events" });
  }
});

// POST /api/admin/ban — Ban a user by email
router.post("/admin/ban", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [admin] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!admin?.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { email, reason } = req.body as { email?: string; reason?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const emailHash = hashIdentifier(email.toLowerCase());
    await db.insert(bannedIdentitiesTable).values({
      identifierType: "email",
      identifierHash: emailHash,
      reason: reason ?? null,
      sourceUserId: req.userId!,
    }).onConflictDoNothing();

    // Also disable the user account if it exists
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (user) {
      await db.update(usersTable).set({ status: "banned" }).where(eq(usersTable.id, user.id));
    }

    logger.info({ email, reason }, "User banned");
    res.json({ banned: true });
  } catch (err) {
    logger.error({ err }, "Ban failed");
    res.status(500).json({ error: "Ban failed" });
  }
});

// POST /api/admin/unban — Unban a user by email
router.post("/admin/unban", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [admin] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!admin?.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const emailHash = hashIdentifier(email.toLowerCase());
    await db.delete(bannedIdentitiesTable).where(eq(bannedIdentitiesTable.identifierHash, emailHash));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (user) {
      await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, user.id));
    }

    logger.info({ email }, "User unbanned");
    res.json({ unbanned: true });
  } catch (err) {
    logger.error({ err }, "Unban failed");
    res.status(500).json({ error: "Unban failed" });
  }
});

export default router;
