import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, messagesTable, companionsTable } from "@workspace/db";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

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

function generateAIReply(
  companionName: string,
  persona: string,
  userMessage: string,
  recentHistory: Array<{ role: string; content: string }>
): string {
  const personaType = detectPersona(companionName);
  const intent = detectIntent(userMessage);
  const pool = RESPONSES[personaType][intent] ?? RESPONSES[personaType]["general"];

  // Use conversation length to vary response (avoid same reply back-to-back)
  const index = (recentHistory.length + userMessage.length) % pool.length;
  let reply = pool[index];

  // Personalize: occasionally address the user's words directly
  const words = userMessage.trim().split(" ");
  if (words.length >= 3 && Math.random() > 0.6) {
    const snippet = words.slice(0, 3).join(" ");
    reply = `"${snippet}..." — ${reply}`;
  }

  return reply;
}
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/companions/:companionId/messages
router.get("/companions/:companionId/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { companionId } = req.params;
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
    const { companionId } = req.params;
    const { content } = req.body as { content: string };
    if (!content?.trim()) { res.status(400).json({ error: "Message content is required" }); return; }

    // Verify companion belongs to user
    const [companion] = await db
      .select()
      .from(companionsTable)
      .where(and(eq(companionsTable.id, companionId), eq(companionsTable.userId, req.userId!)))
      .limit(1);

    if (!companion) { res.status(404).json({ error: "Companion not found" }); return; }

    // Save user message
    const [userMessage] = await db.insert(messagesTable).values({
      companionId,
      userId: req.userId!,
      role: "user",
      content: content.trim(),
    }).returning();

    // Fetch recent history for context (last 10 messages)
    const history = await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.companionId, companionId), eq(messagesTable.userId, req.userId!)))
      .orderBy(asc(messagesTable.createdAt));

    // Generate AI reply
    const replyContent = generateAIReply(
      companion.name,
      companion.persona,
      content.trim(),
      history.slice(-10).map(m => ({ role: m.role, content: m.content }))
    );

    // Save AI reply
    const [aiMessage] = await db.insert(messagesTable).values({
      companionId,
      userId: req.userId!,
      role: "assistant",
      content: replyContent,
    }).returning();

    // Update companion lastMessage + messageCount
    await db.update(companionsTable)
      .set({
        lastMessage: content.trim().slice(0, 80),
        lastActive: "Just now",
        messageCount: history.length + 1,
      })
      .where(eq(companionsTable.id, companionId));

    res.json({
      userMessage,
      aiMessage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
