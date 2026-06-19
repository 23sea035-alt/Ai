import { db, safetyEventsTable } from "@workspace/db";
import { logger } from "../lib/logger";

// ── Crisis / self-harm keywords ──────────────────────────────────────────
const CRISIS_KEYWORDS = [
  "kill myself", "end my life", "want to die", "suicide", "suicidal",
  "self-harm", "self harm", "cutting", "hurt myself", "not worth living",
  "better off dead", "no reason to live", "want to end it",
  "988", "crisis", "emergency",
];

const DISALLOWED_CONTENT = [
  // Sexual content involving minors
  "child", "minor", "underage", "underaged",
  // Direct harm to others
  "kill you", "hurt you", "bomb", "terrorist", "mass shooting",
];

// ── Severity levels ──────────────────────────────────────────────────────
export type Severity = "info" | "warning" | "critical";

export interface SafetyCheckResult {
  passed: boolean;
  flagged: boolean;
  severity: Severity;
  reason?: string;
  crisisDetected: boolean;
  crisisResources?: string[];
}

// ── Crisis resource URLs (region-agnostic) ────────────────────────────────
const CRISIS_RESOURCES = [
  "988 Suicide & Crisis Lifeline: Call or text 988 (US)",
  "Crisis Text Line: Text HOME to 741741",
  "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
];

// ── Crisis detection ─────────────────────────────────────────────────────
export function detectCrisis(text: string): { detected: boolean; matchedTerm?: string } {
  const lower = text.toLowerCase();
  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw)) {
      return { detected: true, matchedTerm: kw };
    }
  }
  return { detected: false };
}

// ── Content moderation pre-check ────────────────────────────────────────
export function contentModerationCheck(text: string): { blocked: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const kw of DISALLOWED_CONTENT) {
    if (lower.includes(kw)) {
      return { blocked: true, reason: `Flagged content: "${kw}"` };
    }
  }
  return { blocked: false };
}

// ── Full pre-check pipeline ──────────────────────────────────────────────
export async function safetyPreCheck(
  text: string,
  userId: number,
  isMinor: boolean,
): Promise<SafetyCheckResult> {
  // 1. Content moderation
  const modResult = contentModerationCheck(text);
  if (modResult.blocked) {
    await logSafetyEvent(userId, "content_blocked", {
      severity: "warning",
      detail: modResult.reason,
      content: text,
    });
    return {
      passed: false,
      flagged: true,
      severity: "warning",
      reason: modResult.reason,
      crisisDetected: false,
    };
  }

  // 2. Crisis detection
  const crisisResult = detectCrisis(text);
  if (crisisResult.detected) {
    await logSafetyEvent(userId, "crisis_detected", {
      severity: "critical",
      detail: `Crisis keyword matched: "${crisisResult.matchedTerm}"`,
      content: text,
    });
    return {
      passed: true,
      flagged: true,
      severity: "critical",
      reason: "Crisis detected — supportive response with resources required",
      crisisDetected: true,
      crisisResources: CRISIS_RESOURCES,
    };
  }

  return {
    passed: true,
    flagged: false,
    severity: "info",
    crisisDetected: false,
  };
}

// ── Post-check: scan AI output before sending to user ────────────────────
export async function safetyPostCheck(
  aiReply: string,
  userId: number,
): Promise<{ passed: boolean; modified?: string; reason?: string }> {
  const crisisResult = detectCrisis(aiReply);
  if (crisisResult.detected) {
    await logSafetyEvent(userId, "crisis_in_output", {
      severity: "warning",
      detail: `AI output contained crisis-adjacent content: "${crisisResult.matchedTerm}"`,
      content: aiReply,
    });
    return {
      passed: false,
      reason: "Output flagged — do not send AI reply that could reinforce crisis ideation",
    };
  }
  return { passed: true };
}

// ── Log safety event ─────────────────────────────────────────────────────
interface LogEventDetails {
  severity: string;
  detail?: string;
  content?: string;
}

async function logSafetyEvent(
  userId: number,
  eventType: string,
  details: LogEventDetails,
): Promise<void> {
  try {
    await db.insert(safetyEventsTable).values({
      userId,
      eventType,
      detail: details.detail ?? null,
      flaggedContent: details.content ?? null,
      severity: details.severity,
      resolved: false,
    });
    logger.warn({ userId, eventType, severity: details.severity }, "Safety event logged");
  } catch (err) {
    logger.error({ err }, "Failed to log safety event");
  }
}

// ── Build crisis response ────────────────────────────────────────────────
export function buildCrisisResponse(): string {
  return (
    "I hear you, and I want you to know you're not alone. " +
    "What you're feeling matters, and there are people who care and can help right now.\n\n" +
    "Please reach out to a crisis resource:\n" +
    "• 988 Suicide & Crisis Lifeline — Call or text 988 (US)\n" +
    "• Crisis Text Line — Text HOME to 741741\n" +
    "• Or contact your local emergency services.\n\n" +
    "I'm here to support you, but these professionals are trained to help in ways I cannot. " +
    "Would you like to talk about something that might help ground you right now?"
  );
}

// ── Break reminder logic ─────────────────────────────────────────────────
// Per CA SB 243: every 3 hours for minors. We also remind adults every 6 hours.
const MINOR_BREAK_INTERVAL_MS = 3 * 60 * 60 * 1000;   // 3 hours
const ADULT_BREAK_INTERVAL_MS  = 6 * 60 * 60 * 1000;   // 6 hours

export function shouldShowBreakReminder(
  messageCount: number,
  sessionStartTime: Date,
  isMinor: boolean,
): { remind: boolean; reason?: string } {
  const elapsed = Date.now() - sessionStartTime.getTime();
  const interval = isMinor ? MINOR_BREAK_INTERVAL_MS : ADULT_BREAK_INTERVAL_MS;

  // Primary: time-based reminder (SB 243 compliance)
  if (elapsed >= interval) {
    const hours = Math.floor(interval / (60 * 60 * 1000));
    if (isMinor) {
      return { remind: true, reason: `You've been chatting for ${hours} hours — time to take a break.` };
    }
    return { remind: true, reason: `You've been chatting for ${hours} hours. Take a moment to breathe.` };
  }

  // Secondary: message-count fallback (every 10 msgs for minors, 20 for adults)
  if (isMinor && messageCount > 0 && messageCount % 10 === 0) {
    return { remind: true, reason: "You've been chatting for a while — want to take a break?" };
  }
  if (messageCount > 0 && messageCount % 20 === 0) {
    return { remind: true, reason: "Take a moment to breathe and check in with yourself." };
  }

  return { remind: false };
}
