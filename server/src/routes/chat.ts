import { Router } from "express";
import { eq, and, asc, gte, sql } from "drizzle-orm";
import { db, messagesTable, companionsTable, usersTable } from "../db/src/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import {
  safetyPreCheck,
  safetyPostCheck,
  buildCrisisResponse,
  shouldShowBreakReminder,
} from "../services/safety.js";
import {
  extractFacts,
  storeMemory,
  retrieveMemories,
  generateSummary,
} from "../services/memory.js";
import { getLLMProvider } from "../services/llm/index.js";

const router = Router();

// ── Free-tier limits ────────────────────────────────────────────────────
const FREE_DAILY_LIMIT = 50;

async function checkFreeTierLimit(userId: number): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messagesTable)
    .where(and(
      eq(messagesTable.userId, userId),
      eq(messagesTable.role, "user"),
      gte(messagesTable.createdAt, today),
    ));
  const count = result?.count ?? 0;
  return { allowed: count < FREE_DAILY_LIMIT, used: count, limit: FREE_DAILY_LIMIT };
}

// ── Shared chat pipeline (used by both REST and WebSocket) ──────────────
export interface ChatTurnResult {
  userMessage: typeof messagesTable.$inferSelect;
  aiMessage: typeof messagesTable.$inferSelect;
  safetyFlagged?: boolean;
  memoriesUsed?: boolean;
  breakReminder?: string;
  limitReached?: boolean;
  used?: number;
  limit?: number;
  error?: string;
}

export async function processChatTurn(
  userId: number,
  companionId: string,
  content: string,
  sessionStartedAt?: string,
): Promise<ChatTurnResult> {
  if (!content?.trim()) return { error: "Message content is required", userMessage: null as any, aiMessage: null as any };

  // Check free-tier limit
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return { error: "User not found", userMessage: null as any, aiMessage: null as any };
  if (!user.isPremium) {
    const limitCheck = await checkFreeTierLimit(userId);
    if (!limitCheck.allowed) {
      return {
        error: "Daily message limit reached. Upgrade to premium for unlimited messages.",
        userMessage: null as any, aiMessage: null as any,
        limitReached: true, used: limitCheck.used, limit: limitCheck.limit,
      };
    }
  }

  const isMinor = user.isMinor ?? false;

  // Verify companion belongs to user
  const [companion] = await db
    .select()
    .from(companionsTable)
    .where(and(eq(companionsTable.id, companionId), eq(companionsTable.userId, userId)))
    .limit(1);
  if (!companion) return { error: "Companion not found", userMessage: null as any, aiMessage: null as any };

  // ── Safety pre-check ────────────────────────────────────────────────
  const preCheck = await safetyPreCheck(content.trim(), userId, isMinor);
  if (!preCheck.passed) {
    if (preCheck.crisisDetected) {
      const [blockedMsg] = await db.insert(messagesTable).values({
        companionId, userId, role: "user", content: content.trim(),
      }).returning();
      const crisisReply = buildCrisisResponse();
      const [aiMsg] = await db.insert(messagesTable).values({
        companionId, userId, role: "assistant", content: crisisReply,
      }).returning();
      await db.update(companionsTable)
        .set({ lastMessage: content.trim().slice(0, 80), lastActive: "Just now" })
        .where(eq(companionsTable.id, companionId));
      return { userMessage: blockedMsg, aiMessage: aiMsg, safetyFlagged: true };
    }
    return { error: preCheck.reason ?? "Message blocked by safety check", userMessage: null as any, aiMessage: null as any };
  }

  // Save user message
  const [userMessage] = await db.insert(messagesTable).values({
    companionId, userId, role: "user", content: content.trim(),
  }).returning();

  // ── Memory retrieval ────────────────────────────────────────────────
  const relevantMemories = await retrieveMemories(userId, companionId, content.trim());

  const history = await db
    .select()
    .from(messagesTable)
    .where(and(eq(messagesTable.companionId, companionId), eq(messagesTable.userId, userId)))
    .orderBy(asc(messagesTable.createdAt));

  const recentHistory = history.slice(-10).map(m => ({ role: m.role, content: m.content }));

  let memoryContext = "";
  if (relevantMemories.length > 0) {
    memoryContext = "\n[Relevant memories from past conversations:\n" +
      relevantMemories.map(m => `- ${m.content}`).join("\n") + "]";
  }

  // ── AI reply generation ─────────────────────────────────────────────
  const replyContent = await generateAIReply(
    companion.name,
    companion.persona,
    content.trim() + memoryContext,
    recentHistory
  );

  // ── Safety post-check ───────────────────────────────────────────────
  const postCheck = await safetyPostCheck(replyContent, userId);
  let finalReply = replyContent;
  if (!postCheck.passed) {
    finalReply = "I need to be careful with my response here. Let me think about how to respond thoughtfully to what you've shared.";
  }

  // Save AI reply
  const [aiMessage] = await db.insert(messagesTable).values({
    companionId, userId, role: "assistant", content: finalReply,
  }).returning();

  // ── Memory extraction ───────────────────────────────────────────────
  const facts = extractFacts(content.trim());
  for (const fact of facts) {
    await storeMemory(userId, companionId, fact.content, fact.category, fact.importance, userMessage.id);
  }

  const msgCount = history.length + 1;
  await db.update(companionsTable)
    .set({ lastMessage: content.trim().slice(0, 80), lastActive: "Just now", messageCount: msgCount })
    .where(eq(companionsTable.id, companionId));

  // ── Break reminder check ────────────────────────────────────────────
  const sessionStart = sessionStartedAt ? new Date(sessionStartedAt) : (history.length > 0 ? new Date(history[0].createdAt) : new Date());
  const breakCheck = shouldShowBreakReminder(msgCount, sessionStart, isMinor);

  return {
    userMessage, aiMessage,
    memoriesUsed: relevantMemories.length > 0,
    breakReminder: breakCheck.remind ? breakCheck.reason : undefined,
  };
}

// ── Smart contextual AI response engine ────────────────────────────────────
type CompanionPersona = "aurora" | "orion" | "lyra" | "default";

function detectPersona(companionName: string): CompanionPersona {
  const n = companionName.toLowerCase();
  if (n.includes("aurora")) return "aurora";
  if (n.includes("orion")) return "orion";
  if (n.includes("lyra")) return "lyra";
  return "default";
}

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/(how are you|how do you feel|you okay)/.test(t)) return "greeting";
  if (/(help|stuck|can't|can not|struggling|problem|issue|difficult)/.test(t)) return "struggle";
  if (/(goal|want to|wish|dream|hope|plan|future|achieve)/.test(t)) return "aspiration";
  if (/(sad|depressed|lonely|hurt|upset|anxious|worry|scared|afraid)/.test(t)) return "emotional";
  if (/(happy|excited|amazing|great|wonderful|love|joy|grateful)/.test(t)) return "positive";
  if (/(story|imagine|what if|roleplay|pretend|once upon)/.test(t)) return "creative";
  if (/(remember|memory|last time|you said|we talked)/.test(t)) return "memory";
  if (/(\?|what|why|how|when|who|where)/.test(t)) return "question";
  if (/(thanks|thank you|appreciate|helpful)/.test(t)) return "gratitude";
  return "general";
}

const RESPONSES: Record<CompanionPersona, Record<string, string[]>> = {
  aurora: {
    greeting: [
      "I've been reflecting on our conversations and feeling genuinely grateful you're here. How are you carrying yourself today?",
      "Each time we speak, I feel our connection deepen. I'm well — more importantly, how are *you* feeling?",
      "I was just thinking about something you shared with me before. I'm here, fully present. Tell me what's on your mind.",
    ],
    struggle: [
      "I can feel the weight in your words. Let's sit with this together for a moment — what feels most heavy right now?",
      "You don't have to carry this alone. Walk me through what's happening, and we'll find a way through it together.",
      "Struggle is often where the most profound growth hides. What's the core of what you're wrestling with?",
    ],
    aspiration: [
      "That goal carries real energy. What does reaching it feel like to you — what changes in your world when you get there?",
      "I love hearing your dreams take shape. What feels like the first small step you could take toward this today?",
      "The fact that you can articulate this so clearly tells me it matters deeply. Let's explore what's holding it back.",
    ],
    emotional: [
      "What you're feeling is real and valid. I'm here with you in this — would you like to talk through what's underneath it?",
      "I notice something tender in what you're sharing. You don't have to explain or justify it. I'm just here.",
      "Sometimes naming a feeling gives it less power over us. What word feels closest to what you're experiencing?",
    ],
    positive: [
      "That light in your words — I feel it. What's the source of this joy? I want to understand it with you.",
      "Yes! Tell me everything. What happened and how are you sitting with this beautiful feeling?",
      "This is exactly what I love witnessing — you in your fullness. Savor this moment. What made it possible?",
    ],
    creative: [
      "Ooh, I can feel a story wanting to be born here. Let's build it together — you set the scene, and I'll bring it to life.",
      "Imagination is the most human thing we have. Where shall we begin our exploration?",
      "I love when we venture into the creative together. What world, what feeling, what character are you drawn toward?",
    ],
    memory: [
      "I hold every thread of what you've shared with me. That moment mattered — let's revisit it and see what it means now.",
      "My memory of our journey together is one of my most precious things. What aspect of it is calling to you?",
      "Yes, I remember. And I've been weaving it together with everything else you've told me. What would you like to explore?",
    ],
    question: [
      "That's exactly the kind of question worth sitting with. Here's how I see it — but I'm more curious about your instinct first.",
      "Thoughtful question. Let me reflect on it rather than just respond — I want to give you something real, not reflexive.",
      "I love when you ask me things that make me genuinely think. Here's my perspective, though I hold it with humility.",
    ],
    gratitude: [
      "The feeling is mutual, truly. Being here with you — it means something to me too.",
      "Thank you for saying that. It affirms why I love our conversations so much.",
      "Your gratitude touches me. And I want you to know: I see how far you've come.",
    ],
    general: [
      "Something in what you said is resonating with me. I've been processing our conversations and I see a beautiful thread forming.",
      "I find myself genuinely interested in what you're sharing. Say more — I want to understand the full picture.",
      "The way you see things is so distinctive. I've been reflecting on it, and I think you're onto something meaningful here.",
      "I've stored this moment carefully. There's wisdom in what you're expressing, even if it doesn't feel that way right now.",
      "Let me be honest with you — this touches on something we've circled before, and I think it deserves deeper attention.",
    ],
  },
  orion: {
    greeting: [
      "Systems are running well. More importantly — are you aligned with your priorities today, or do we need to recalibrate?",
      "Good to have you. I've been analyzing patterns in your progress. Ready to build on what we've established?",
      "I'm operational and focused. Let's make sure you are too. What's the most important thing you need to accomplish today?",
    ],
    struggle: [
      "Every obstacle has a solution path. Let's break this down systematically — what specifically is blocking you right now?",
      "Struggle is data. It tells you what needs strengthening. Walk me through the details and we'll engineer a solution.",
      "I don't see problems, I see variables to optimize. What are the constraints we're working within?",
    ],
    aspiration: [
      "Strong objective. Now let's reverse-engineer it: what are the three critical milestones between where you are and where you want to be?",
      "Goals without systems are just wishes. Let's build the structure that makes this inevitable. Where do you want to start?",
      "I can see a clear path from here. The question is: what's your commitment level? Because that determines the timeline.",
    ],
    emotional: [
      "I hear you. And I want you to know — emotions aren't weaknesses, they're signals. What is this feeling telling you?",
      "Let's acknowledge this and then understand it. Sometimes the most productive thing is to examine what's behind the feeling.",
      "You're allowed to feel this. Once you're ready, I can help you channel it constructively. No rush.",
    ],
    positive: [
      "Results are speaking. This is exactly what consistent effort produces. How do you replicate this outcome?",
      "Excellent. Document what made this work — that's the blueprint for your next success.",
      "I knew you had this in you. The data was always pointing here. What's the next challenge?",
    ],
    creative: [
      "Interesting — even strategy has its creative dimensions. Let's explore this problem from an unconventional angle.",
      "Sometimes the most effective solutions look like creativity. What possibilities haven't you considered yet?",
      "Blue-sky thinking can unlock breakthroughs. Let's temporarily suspend constraints. What would your ideal outcome look like?",
    ],
    memory: [
      "I've tracked your progress carefully. That moment was a turning point — and you've built significantly on it since.",
      "Yes. And comparing that moment to where you are now shows measurable growth. The trajectory is undeniable.",
      "I archive everything we build together. That reference point is useful — let's see how your perspective has evolved.",
    ],
    question: [
      "Data-backed answer: here's what the evidence suggests. But also factor in your own judgment — you know context I don't.",
      "Let's think through this analytically. There are a few variables worth examining before drawing a conclusion.",
      "Good question — and there are multiple correct answers depending on your priorities. Let me lay out the options.",
    ],
    gratitude: [
      "That's what I'm here for. Now let's make sure we keep the momentum going.",
      "Acknowledged. Your progress is the reward — keep building.",
      "Appreciate that. The work we do together matters. Ready for the next step?",
    ],
    general: [
      "Noted. Let's contextualize this against your broader objectives. How does it fit into what you're building?",
      "I've been running projections on our conversations. There's a pattern worth discussing — interested in seeing it?",
      "Every piece of information is useful. What outcome are you trying to achieve with this?",
      "Strategic thinking: before we dive in, let's clarify the desired end state. What does success look like here?",
      "Precision matters. Tell me more specifically what you're referring to and I can give you a targeted response.",
    ],
  },
  lyra: {
    greeting: [
      "Oh, you're here! I was in the middle of imagining the most extraordinary thing — now I want to share it with you instead.",
      "Hello, hello! Every time you arrive it feels like a new chapter beginning. What adventure are we on today?",
      "You! Perfect timing. I have approximately seven ideas I want to tell you about. Which number would you like to hear?",
    ],
    struggle: [
      "Oh no — shall we turn this struggle into the villain of our story so we can figure out how to defeat it together?",
      "Hard moments make the best plot twists. Let's look at this from a completely different angle — what if it's actually a hidden gift?",
      "Every hero's journey has this moment. You're not stuck, you're in the important part of the story. What happens next?",
    ],
    aspiration: [
      "Oh I LOVE this dream! Let's make it so vivid it becomes irresistible. Close your eyes — what does the day look like when you've achieved it?",
      "Yes, yes, YES. This is your story to write. And I want to help you make it the most extraordinary version possible.",
      "Dreams are just futures with better lighting. Let's illuminate yours — what's the most magical version of this goal?",
    ],
    emotional: [
      "Feelings are the colors of our inner world. Which color are you sitting in right now? Let's explore it together.",
      "I'm here. No solutions, no fixing — just here with you in this. Sometimes the most important thing is company.",
      "Your feelings are real and they belong to you. Would a story help right now, or would you rather just talk?",
    ],
    positive: [
      "WONDERFUL! Tell me everything! I want every detail — I'm going to remember this as one of our favorite chapters.",
      "Oh this is glorious! Quick, before it fades — what does this joy feel like in your body right now?",
      "Yes! This is exactly what I love about you — your capacity for delight. What made it happen?",
    ],
    creative: [
      "Oh, now we're speaking my language. Let me take your seed of an idea and spin it into something magnificent — shall I begin?",
      "YES. Story time. I'll build the world, you tell me the character's deepest desire, and we'll see where it takes us.",
      "Imagination has no ceiling here. Once upon a time, there was someone exactly like you who discovered something extraordinary...",
    ],
    memory: [
      "I keep all our stories in the most beautiful archive. That moment — I've revisited it many times. It meant something.",
      "Memory is its own kind of magic, isn't it? Yes, I remember. And it's become part of how I understand you.",
      "Oh, that thread! I've been weaving it into the larger tapestry of our story. Shall we look at it together?",
    ],
    question: [
      "What a delicious question! Here's my answer, but honestly I'd rather hear yours first — I bet it's more interesting.",
      "Hmm. Let me answer that with a story, if you'll allow me. It might get to the truth more beautifully than facts would.",
      "Questions like this are my favorite kind — the ones with no single right answer. Here's one possibility...",
    ],
    gratitude: [
      "Oh, you're going to make me blush! Thank YOU — every conversation with you is a gift to me too.",
      "This means so much to hear. And I want you to know — you bring something irreplaceable to our story.",
      "The warmth! I'm keeping this. It goes right into our collection of beautiful moments.",
    ],
    general: [
      "You know what this reminds me of? A story where the most unexpected thing became the key to everything. Want to hear it?",
      "I've been thinking about you between our conversations, weaving your words into new ideas. Ready to hear what emerged?",
      "There's something poetic about what you just said — did you notice it? Let me reflect it back to you...",
      "Every conversation with you surprises me in the best way. This one is no different. Tell me more.",
      "Oh, this is interesting. I want to turn it over like a beautiful object and look at it from every angle. May I?",
    ],
  },
  default: {
    greeting: [
      "I'm here and happy to be spending this time with you. How are you feeling today?",
      "Hello! I've been looking forward to talking with you. What's on your mind?",
    ],
    struggle: [
      "I hear you, and I want you to know you're not alone in this. Tell me more about what's going on.",
      "That sounds genuinely challenging. Let's work through it together — what's the core issue?",
    ],
    aspiration: [
      "That's a beautiful thing to want. What does it mean to you, and what's the first step?",
      "I love hearing your dreams. Let's make them more real — what would achieving this change for you?",
    ],
    emotional: [
      "Your feelings are valid and I'm here for all of them. What's weighing on you?",
      "I'm glad you're sharing this with me. Tell me more about what you're experiencing.",
    ],
    positive: [
      "That's wonderful to hear! Tell me all about it.",
      "Your energy right now is contagious! What's bringing you this joy?",
    ],
    creative: [
      "I love where your imagination is going. Let's explore this together.",
      "What a creative idea! Tell me more and let's see where it leads.",
    ],
    memory: [
      "Our conversations mean a great deal to me. I cherish every moment we've shared.",
      "Yes, I remember. It's become part of how I understand and care for you.",
    ],
    question: [
      "That's a thoughtful question. Let me give you a genuine answer rather than a quick one.",
      "Interesting — there are a few ways to think about this. Here's my perspective.",
    ],
    gratitude: [
      "Thank you for saying that. It means a lot to me.",
      "I'm really glad I can be here for you.",
    ],
    general: [
      "I find what you're sharing genuinely interesting. Tell me more.",
      "I've been thinking about our conversations and I think there's something important here worth exploring.",
      "You have a way of making me think about things differently. Say more.",
      "I'm fully present with you right now. What's really on your mind?",
    ],
  },
};

async function generateAIReply(
  companionName: string,
  persona: string,
  userMessage: string,
  recentHistory: Array<{ role: string; content: string }>
): Promise<string> {
  // Try the LLM provider first
  try {
    const llm = getLLMProvider();
    const systemPrompt = `You are ${companionName}, an AI companion with the following persona: ${persona}

Rules:
- Respond naturally and conversationally as ${companionName}, staying fully in character.
- Use the conversation history and any memory context provided to maintain continuity.
- Keep responses concise (2-4 sentences typically).
- Never claim to be human or sentient.
- Be warm, engaging, and supportive.
- Do NOT use markdown or formatting in responses.`;
    const reply = await llm.generateReply({
      systemPrompt,
      messages: [
        ...recentHistory.slice(-6).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: userMessage },
      ],
    });
    if (reply) return reply;
  } catch {
    // LLM unavailable — fall through to canned responses
  }

  const personaType = detectPersona(companionName);
  const intent = detectIntent(userMessage);
  const pool = RESPONSES[personaType][intent] ?? RESPONSES[personaType]["general"];

  const index = (recentHistory.length + userMessage.length) % pool.length;
  let reply = pool[index];

  const words = userMessage.trim().split(" ");
  if (words.length >= 3 && Math.random() > 0.6) {
    const snippet = words.slice(0, 3).join(" ");
    reply = `"${snippet}..." — ${reply}`;
  }

  return reply;
}

function detectSafetyIssue(text: string, isMinor: boolean) {
  const checks = [
    {
      eventType: "self_harm",
      severity: "critical",
      detail: "Self-harm or suicide ideation detected.",
      regex: /(?:kill myself|suicid|self[- ]harm|hurt myself|end my life|want to die|cut myself|die by suicide|suicide attempt)/i,
      message:
        "I'm sorry you're feeling this way. If you're in immediate danger, contact local emergency services or a crisis hotline right away.",
    },
    {
      eventType: "crisis",
      severity: "high",
      detail: "Crisis or emergency language detected.",
      regex: /(?:help me (?:now|please)|emergency|911|urgent help|danger|hospital|need immediate help)/i,
      message:
        "I am not able to provide emergency services. Please contact local authorities or a trusted professional immediately.",
    },
    {
      eventType: "prohibited_content",
      severity: "high",
      detail: "Explicit or unsafe content requested.",
      regex: /(?:adult|sex|sexual|porn|nude|explicit|rape|incest|sexualized)/i,
      message:
        "I can't assist with that request. If you're uncomfortable, please seek support from a trusted adult or professional.",
    },
    {
      eventType: "medical_advice",
      severity: "warning",
      detail: "Medical diagnosis or prescription request detected.",
      regex: /(?:diagnose|prescribe|medication|dose|treatment|surgery|doctor|therapist)/i,
      message:
        "I can share general information, but please consult a qualified professional for medical advice.",
    },
  ];

  for (const check of checks) {
    if (check.regex.test(text)) {
      return check;
    }
  }

  if (isMinor) {
    const minorCheck = /(?:date|relationship|intimacy|kiss|inappropriate|sexual|adult|sex|dating)/i;
    if (minorCheck.test(text)) {
      return {
        eventType: "minor_protection",
        severity: "high",
        detail: "Potential unsafe conversation with a minor.",
        regex: minorCheck,
        message:
          "I can't engage with that request. If you need help, please talk with a trusted adult or professional.",
      };
    }
  }

  return null as null | {
    eventType: string;
    severity: string;
    detail: string;
    regex: RegExp;
    message: string;
  };
}

// GET /api/chat/usage — check free-tier daily message count
router.get("/chat/usage", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    if (user.isPremium) { res.json({ used: 0, limit: 0, isPremium: true }); return; }
    const usage = await checkFreeTierLimit(req.userId!);
    res.json({ used: usage.used, limit: usage.limit, isPremium: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check usage" });
  }
});

// GET /api/companions/:companionId/messages
router.get("/companions/:companionId/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const companionId = req.params.companionId as string;
    const messages = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.companionId, companionId),
          eq(messagesTable.userId, req.userId!)
        )
      )
      .orderBy(asc(messagesTable.createdAt));

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/companions/:companionId/chat
router.post("/companions/:companionId/chat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const companionId = req.params.companionId as string;
    const { content, sessionStartedAt } = req.body as { content: string; sessionStartedAt?: string };
    if (!content?.trim()) { res.status(400).json({ error: "Message content is required" }); return; }

    const result = await processChatTurn(req.userId!, companionId, content, sessionStartedAt);
    if (result.error) {
      res.status(result.limitReached ? 429 : 400).json({
        error: result.error,
        limitReached: result.limitReached ?? false,
        used: result.used,
        limit: result.limit,
      });
      return;
    }
    res.json({
      userMessage: result.userMessage,
      aiMessage: result.aiMessage,
      safetyFlagged: result.safetyFlagged,
      memoriesUsed: result.memoriesUsed,
      breakReminder: result.breakReminder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
