import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, companionsTable } from "@workspace/db";
import { signToken } from "../middleware/auth.js";

const router = Router();

const DEFAULT_COMPANIONS = [
  {
    id: "aurora",
    name: "Aurora",
    persona: "Empathetic, wise, and deeply curious. Aurora specializes in emotional support, creative exploration, and reflective conversations.",
    traits: ["Empathetic", "Creative", "Wise", "Curious"],
    colorFrom: "#c9bfff",
    colorTo: "#8fd8ff",
    lastMessage: "Ready to explore your thoughts with you...",
    lastActive: "Active now",
    isDefault: true,
  },
  {
    id: "orion",
    name: "Orion",
    persona: "Strategic, analytical, and motivating. Orion excels at goal-setting, problem-solving, and keeping you accountable.",
    traits: ["Strategic", "Analytical", "Motivating"],
    colorFrom: "#8fd8ff",
    colorTo: "#c9bfff",
    lastMessage: "Let's tackle your goals today.",
    lastActive: "2m ago",
    isDefault: true,
  },
  {
    id: "lyra",
    name: "Lyra",
    persona: "Playful, imaginative, and storytelling. Lyra loves creative writing, roleplay, and bringing stories to life.",
    traits: ["Playful", "Imaginative", "Creative"],
    colorFrom: "#ffb77d",
    colorTo: "#8fd8ff",
    lastMessage: "What story shall we write today?",
    lastActive: "1h ago",
    isDefault: true,
  },
];

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, birthYear } = req.body as { name: string; email: string; password: string; birthYear?: number };
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required" });
      return;
    }

    // Age gate: require birthYear
    if (!birthYear || typeof birthYear !== "number" || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      res.status(400).json({ error: "Valid birth year is required" });
      return;
    }

    const age = new Date().getFullYear() - birthYear;
    const isMinor = age < 18;

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      birthYear,
      isMinor,
      ageVerified: true,
    }).returning();

    // Seed default companions for new user (user-scoped IDs)
    for (const comp of DEFAULT_COMPANIONS) {
      await db.insert(companionsTable).values({
        id: `${comp.id}-${user.id}`,
        userId: user.id,
        name: comp.name,
        persona: comp.persona,
        traits: comp.traits,
        colorFrom: comp.colorFrom,
        colorTo: comp.colorTo,
        lastMessage: comp.lastMessage ?? null,
        lastActive: comp.lastActive ?? null,
        isDefault: comp.isDefault,
        messageCount: 0,
      }).onConflictDoNothing();
    }

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthYear: user.birthYear,
        isPremium: user.isPremium,
        isMinor: user.isMinor,
        ageVerified: user.ageVerified,
        onboardingDone: user.onboardingDone,
        aiDisclosureAccepted: user.aiDisclosureAccepted,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthYear: user.birthYear,
        isPremium: user.isPremium,
        isMinor: user.isMinor,
        ageVerified: user.ageVerified,
        onboardingDone: user.onboardingDone,
        aiDisclosureAccepted: user.aiDisclosureAccepted,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const jwt = await import("jsonwebtoken");
    const token = header.slice(7);
    const payload = jwt.default.verify(token, process.env.SESSION_SECRET ?? "aura-ai-secret-2026") as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      birthYear: user.birthYear,
      isPremium: user.isPremium,
      isMinor: user.isMinor,
      ageVerified: user.ageVerified,
      onboardingDone: user.onboardingDone,
      aiDisclosureAccepted: user.aiDisclosureAccepted,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// PUT /api/auth/me — update profile
router.put("/auth/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const jwt = await import("jsonwebtoken");
    const token = header.slice(7);
    const payload = jwt.default.verify(token, process.env.SESSION_SECRET ?? "aura-ai-secret-2026") as { userId: number };
    const { name, email, birthYear, isPremium, isMinor, ageVerified, onboardingDone, aiDisclosureAccepted } = req.body as Partial<{
      name: string; email: string; birthYear: number; isPremium: boolean; isMinor: boolean;
      ageVerified: boolean; onboardingDone: boolean; aiDisclosureAccepted: boolean;
    }>;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (isPremium !== undefined) updates.isPremium = isPremium;
    if (birthYear !== undefined) {
      const parsedBirthYear = typeof birthYear === "number" && !Number.isNaN(birthYear) ? birthYear : undefined;
      if (!parsedBirthYear || parsedBirthYear <= 1900 || parsedBirthYear > new Date().getFullYear()) {
        res.status(400).json({ error: "Invalid birth year" });
        return;
      }
      updates.birthYear = parsedBirthYear;
      updates.ageVerified = true;
      updates.isMinor = new Date().getFullYear() - parsedBirthYear < 18;
    }
    if (isMinor !== undefined) updates.isMinor = isMinor;
    if (ageVerified !== undefined) updates.ageVerified = ageVerified;
    if (onboardingDone !== undefined) updates.onboardingDone = onboardingDone;
    if (aiDisclosureAccepted !== undefined) updates.aiDisclosureAccepted = aiDisclosureAccepted;

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, payload.userId)).returning();
    res.json({
      id: user.id, name: user.name, email: user.email,
      birthYear: user.birthYear,
      isPremium: user.isPremium, isMinor: user.isMinor,
      ageVerified: user.ageVerified, onboardingDone: user.onboardingDone,
      aiDisclosureAccepted: user.aiDisclosureAccepted,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
