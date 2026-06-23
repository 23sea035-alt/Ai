import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, companionsTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /api/companions
router.get("/companions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const companions = await db
      .select()
      .from(companionsTable)
      .where(eq(companionsTable.userId, req.userId!))
      .orderBy(companionsTable.createdAt);
    res.json(companions);
  } catch (err) {
    logger.error({ err }, "Failed to fetch companions");
  }
});

// POST /api/companions
router.post("/companions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, personaKey, traits } = req.body as {
      name: string; personaKey: string; traits: Record<string, unknown>;
    };
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }

    const [companion] = await db.insert(companionsTable).values({
      userId: req.userId!,
      personaKey: personaKey ?? "aurora",
      name: name.trim(),
      traits: traits ?? {},
      lastMessage: "Ready to chat with you!",
      messageCount: 0,
      isDefault: false,
    }).returning();

    res.status(201).json(companion);
  } catch (err) {
    logger.error({ err }, "Failed to create companion");
  }
});

// PUT /api/companions/:id
router.put("/companions/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const updates = req.body as Partial<{
      name: string; personaKey: string; traits: Record<string, unknown>;
      lastMessage: string; lastActiveAt: Date; messageCount: number;
    }>;

    const [companion] = await db
      .update(companionsTable)
      .set(updates)
      .where(and(eq(companionsTable.id, id), eq(companionsTable.userId, req.userId!)))
      .returning();

    if (!companion) { res.status(404).json({ error: "Companion not found" }); return; }
    res.json(companion);
  } catch (err) {
    logger.error({ err }, "Failed to update companion");
  }
});

// DELETE /api/companions/:id
router.delete("/companions/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await db
      .delete(companionsTable)
      .where(and(eq(companionsTable.id, id), eq(companionsTable.userId, req.userId!)));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete companion");
  }
});

export default router;
