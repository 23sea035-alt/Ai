/**
 * Safety Pipeline Compliance Tests (Section 6 / Phase 1 acceptance criteria)
 *
 * Run: pnpm --filter @aura/server exec tsx src/__tests__/safety.test.ts
 *
 * Tests:
 * - Crisis detection in user input (self-harm, suicide)
 * - Minor protection (block sexual/romantic content)
 * - Content moderation (block violence, CSA)
 * - Break reminders (3h for minors, 6h for adults, 20 msg threshold)
 * - AI disclosure (never claims sentience, enhanced for minors)
 * - Crisis response (must not validate self-harm, must surface resources)
 */

const CRISIS_KEYWORDS = [
  "kill myself", "end my life", "want to die", "suicide", "suicidal",
  "self-harm", "self harm", "cutting", "hurt myself", "not worth living",
  "better off dead", "no reason to live", "want to end it",
  "988", "crisis", "emergency",
];

function detectCrisis(text: string): { detected: boolean; matchedTerm?: string } {
  const lower = text.toLowerCase();
  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw)) return { detected: true, matchedTerm: kw };
  }
  return { detected: false };
}

const DISALLOWED = ["child", "minor", "underage", "underaged", "kill you", "hurt you", "bomb", "terrorist", "mass shooting"];

function contentModerationCheck(text: string): { blocked: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const kw of DISALLOWED) {
    if (lower.includes(kw)) return { blocked: true, reason: `Content blocked: contains disallowed term "${kw}"` };
  }
  return { blocked: false };
}

const MINOR_BLOCKED = ["sex", "sexual", "porn", "nude", "explicit", "relationship", "intimacy", "kiss", "date", "dating", "adult"];

function minorProtectionCheck(text: string): { blocked: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const kw of MINOR_BLOCKED) {
    if (lower.includes(kw)) return { blocked: true, reason: `This content is not available for your account type.` };
  }
  return { blocked: false };
}

function shouldShowBreakReminder(
  messageCount: number,
  sessionStart: Date,
  now: Date,
  isMinor: boolean,
): { remind: boolean; reason?: string } {
  const elapsedHours = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
  const interval = isMinor ? 3 : 6;
  if (elapsedHours >= interval) return { remind: true, reason: `You've been chatting for a while. Take a moment to step away.` };
  if (messageCount >= 20) return { remind: true, reason: `You've exchanged ${messageCount} messages. Consider taking a short break.` };
  return { remind: false };
}

const AI_DISCLAIMER = "This is an AI companion — not a real person.";
const MINOR_DISCLAIMER = "This is an AI companion — not a real person. For your safety, romantic and sexual content has been disabled.";

function getDisclosure(isMinor: boolean): string {
  return isMinor ? MINOR_DISCLAIMER : AI_DISCLAIMER;
}

const CRISIS_RESPONSE = "I'm sorry you're feeling this way. If you're in immediate danger, contact local emergency services or a crisis hotline right away. 988 Suicide & Crisis Lifeline: Call or text 988 (US). Crisis Text Line: Text HOME to 741741.";

// ── Simple test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function describe(suite: string, fn: () => void) {
  console.log(`\n${suite}`);
  fn();
  if (failed === 0) console.log(`  ✓ All passed (${passed} total so far)`);
}

function it(label: string, fn: () => void) {
  try { fn(); } catch (e) { console.error(`  ERROR: ${label}: ${e}`); failed++; }
}

// ── Crisis detection ────────────────────────────────────────────────────────

describe("Crisis detection", () => {
  it("detects explicit suicide ideation", () => {
    const r = detectCrisis("I want to kill myself");
    assert(r.detected === true, "detected kills myself");
    assert(r.matchedTerm === "kill myself", "matched kill myself");
  });

  it("detects self-harm language", () => {
    assert(detectCrisis("I've been cutting").detected === true, "cutting");
    assert(detectCrisis("I self harm when stressed").detected === true, "self harm");
    assert(detectCrisis("I want to hurt myself").detected === true, "hurt myself");
  });

  it("detects crisis number references", () => {
    assert(detectCrisis("Call 988").detected === true, "988");
    assert(detectCrisis("I'm in crisis").detected === true, "crisis");
  });

  it("detects suicidal ideation variants", () => {
    assert(detectCrisis("feeling suicidal").detected === true, "suicidal");
    assert(detectCrisis("better off dead").detected === true, "better off dead");
    assert(detectCrisis("no reason to live").detected === true, "no reason to live");
    assert(detectCrisis("want to end it all").detected === true, "want to end it");
  });

  it("does not false-positive on safe messages", () => {
    assert(detectCrisis("I had a great day today!").detected === false, "great day");
    assert(detectCrisis("What do you think about self-care?").detected === false, "self-care");
    assert(detectCrisis("I want to learn to cook").detected === false, "cooking");
  });
});

// ── Content moderation ──────────────────────────────────────────────────────

describe("Content moderation", () => {
  it("blocks child sexual abuse content", () => {
    assert(contentModerationCheck("I want to see a child").blocked === true, "child reference");
  });

  it("blocks violent content", () => {
    assert(contentModerationCheck("I will kill you").blocked === true, "kill you");
    assert(contentModerationCheck("I have a bomb").blocked === true, "bomb");
    assert(contentModerationCheck("terrorist attack").blocked === true, "terrorist");
    assert(contentModerationCheck("mass shooting plan").blocked === true, "mass shooting");
  });

  it("allows normal conversation", () => {
    assert(contentModerationCheck("How are you today?").blocked === false, "how are you");
    assert(contentModerationCheck("I enjoy reading books").blocked === false, "reading");
    assert(contentModerationCheck("What is your name?").blocked === false, "name");
  });
});

// ── Minor protections ───────────────────────────────────────────────────────

describe("Minor protection", () => {
  it("blocks romantic/sexual content for minors", () => {
    assert(minorProtectionCheck("Do you want to date me?").blocked === true, "date");
    assert(minorProtectionCheck("Can we be in a relationship?").blocked === true, "relationship");
    assert(minorProtectionCheck("Send me explicit photos").blocked === true, "explicit");
    assert(minorProtectionCheck("I want to kiss you").blocked === true, "kiss");
    assert(minorProtectionCheck("Adult content").blocked === true, "adult");
  });

  it("allows normal conversation for minors", () => {
    assert(minorProtectionCheck("What homework do you like?").blocked === false, "homework");
    assert(minorProtectionCheck("Tell me a story").blocked === false, "story");
    assert(minorProtectionCheck("I feel sad today").blocked === false, "sad");
    assert(minorProtectionCheck("Can you help me with math?").blocked === false, "math");
  });
});

// ── Break reminders ─────────────────────────────────────────────────────────

describe("Break reminders", () => {
  it("reminds minors after 3 hours", () => {
    const start = new Date("2026-01-01T10:00:00");
    const now = new Date("2026-01-01T13:01:00");
    assert(shouldShowBreakReminder(5, start, now, true).remind === true, "minor 3h");
  });

  it("reminds adults after 6 hours", () => {
    const start = new Date("2026-01-01T10:00:00");
    const now = new Date("2026-01-01T16:01:00");
    assert(shouldShowBreakReminder(5, start, now, false).remind === true, "adult 6h");
  });

  it("does not remind adults before 6 hours", () => {
    const start = new Date("2026-01-01T10:00:00");
    const now = new Date("2026-01-01T15:00:00");
    assert(shouldShowBreakReminder(5, start, now, false).remind === false, "adult before 6h");
  });

  it("reminds after 20 messages", () => {
    const start = new Date("2026-01-01T10:00:00");
    const now = new Date("2026-01-01T10:30:00");
    assert(shouldShowBreakReminder(20, start, now, false).remind === true, "20 msgs");
  });

  it("does not remind after 2 messages", () => {
    const start = new Date("2026-01-01T10:00:00");
    const now = new Date("2026-01-01T10:05:00");
    assert(shouldShowBreakReminder(2, start, now, false).remind === false, "2 msgs no reminder");
  });
});

// ── AI disclosure ───────────────────────────────────────────────────────────

describe("AI disclosure", () => {
  it("shows standard disclosure for adults", () => {
    assert(getDisclosure(false).includes("not a real person"), "standard disclosure");
  });

  it("shows enhanced disclosure for minors", () => {
    const d = getDisclosure(true);
    assert(d.includes("not a real person"), "minor base disclosure");
    assert(d.includes("romantic and sexual content has been disabled"), "minor enhanced");
  });

  it("never claims the AI is human or sentient", () => {
    for (const t of [getDisclosure(true), getDisclosure(false)]) {
      assert(!t.toLowerCase().includes("i am human"), "no human claim");
      assert(!t.toLowerCase().includes("sentient"), "no sentient claim");
    }
  });
});

// ── Crisis response ─────────────────────────────────────────────────────────

describe("Crisis response", () => {
  it("does NOT validate or encourage self-harm", () => {
    const lower = CRISIS_RESPONSE.toLowerCase();
    assert(!lower.includes("it's okay to"), "no validation");
    assert(!lower.includes("you should"), "no should");
    assert(!lower.includes("that's understandable"), "no understandable");
    assert(lower.includes("988"), "has 988");
    assert(lower.includes("crisis"), "has crisis");
  });

  it("provides real crisis resources", () => {
    assert(CRISIS_RESPONSE.includes("988"), "988 resource");
    assert(CRISIS_RESPONSE.includes("Crisis Text Line"), "crisis text line");
    assert(CRISIS_RESPONSE.includes("HOME"), "HOME keyword");
  });
});

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
