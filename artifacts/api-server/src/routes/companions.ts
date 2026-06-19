import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, companionsTable } from "@workspace/db";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companions" });
  }
});

// POST /api/companions
router.post("/companions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, persona, traits, colorFrom, colorTo } = req.body as {
      name: string; persona: string; traits: string[];
      colorFrom: string; colorTo: string;
    };
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const [companion] = await db.insert(companionsTable).values({
      id,
      userId: req.userId!,
      name: name.trim(),
      persona: persona ?? "",
      traits: traits ?? [],
      colorFrom: colorFrom ?? "#c9bfff",
      colorTo: colorTo ?? "#8fd8ff",
      lastMessage: "Ready to chat with you!",
      lastActive: "Just now",
      messageCount: 0,
      isDefault: false,
    }).returning();

    res.status(201).json(companion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create companion" });
  }
});

// PUT /api/companions/:id
router.put("/companions/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const updates = req.body as Partial<{
      name: string; persona: string; traits: string[];
      colorFrom: string; colorTo: string; lastMessage: string;
      lastActive: string; messageCount: number;
    }>;

    const [companion] = await db
      .update(companionsTable)
      .set(updates)
      .where(and(eq(companionsTable.id, id), eq(companionsTable.userId, req.userId!)))
      .returning();

    if (!companion) { res.status(404).json({ error: "Companion not found" }); return; }
    res.json(companion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update companion" });
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
    console.error(err);
    res.status(500).json({ error: "Failed to delete companion" });
  }
});

export default router;
