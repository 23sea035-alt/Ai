import { describe, it, expect, vi } from "vitest";
import type { UserContext } from "../services/moderation/moderator.js";

const mockRunL0 = vi.fn();
const mockRunL1 = vi.fn();
const mockRunL2Input = vi.fn();
const mockRunL3Output = vi.fn();
const mockAdjudicate = vi.fn();
const mockRunOutputFallback = vi.fn();

vi.mock("../services/moderation/deterministic.js", () => ({
  runL0: (...args: unknown[]) => mockRunL0(...args),
}));

vi.mock("../services/moderation/prompt-guard.js", () => ({
  runL1: (...args: unknown[]) => mockRunL1(...args),
}));

vi.mock("../services/moderation/openai-omni.js", () => ({
  runL2Input: (...args: unknown[]) => mockRunL2Input(...args),
  runL3Output: (...args: unknown[]) => mockRunL3Output(...args),
}));

vi.mock("../services/moderation/safeguard.js", () => ({
  adjudicate: (...args: unknown[]) => mockAdjudicate(...args),
  runOutputFallback: (...args: unknown[]) => mockRunOutputFallback(...args),
}));

const defaultCtx: UserContext = { userId: "test-user", isMinor: false, recentSafetyEvents: 0 };

describe("ModerationEngine — fail-closed contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunL0.mockReturnValue({ action: "pass", category: undefined, reason: undefined });
    mockRunL1.mockResolvedValue({ injectionProb: 0, action: "pass" });
    mockRunL2Input.mockResolvedValue({ flagged: false, categories: [] });
    mockRunL3Output.mockResolvedValue({ flagged: false, categories: [] });
    mockAdjudicate.mockResolvedValue({ action: "allow", reason: "Cleared", confidence: "high" });
    mockRunOutputFallback.mockResolvedValue({ action: "allow", reason: "Cleared", confidence: "high" });
  });

  describe("screenInput — top-level safety net", () => {
    it("returns block on unexpected L0 throw", async () => {
      mockRunL0.mockImplementation(() => { throw new Error("L0 crashed"); });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("fail-closed-safety-net");
      expect(result.reason).toContain("L0 crashed");
    });

    it("L1 rejection → block via internal catch (fail-closed)", async () => {
      mockRunL1.mockRejectedValue(new Error("L1 completely failed"));

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("L1");
    });

    it("L2 rejection → degradation path (fail-closed)", async () => {
      mockRunL2Input.mockRejectedValue(new Error("L2 completely failed"));

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("safeguard");
      expect(result.reason).toContain("cleared by safeguard fallback");
    });

    it("returns block when all providers fail", async () => {
      mockRunL1.mockResolvedValue({ injectionProb: 1, action: "block", error: "L1 failed" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("L1");
    });
  });

  describe("screenInput — L2 degradation path", () => {
    it("L2 degrades to safeguard; safeguard clears → allow", async () => {
      mockRunL2Input.mockResolvedValue({ flagged: true, categories: [], error: "L2 API error" });
      mockAdjudicate.mockResolvedValue({ action: "allow", reason: "Safeguard cleared", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("safeguard");
      expect(result.reason).toContain("cleared by safeguard fallback");
    });

    it("L2 degrades to safeguard; safeguard blocks → block", async () => {
      mockRunL2Input.mockResolvedValue({ flagged: true, categories: [], error: "L2 API error" });
      mockAdjudicate.mockResolvedValue({ action: "block", reason: "Safeguard flagged", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("safeguard");
      expect(result.reason).toContain("safeguard fallback");
    });

    it("L2 degrades and safeguard also errors → block", async () => {
      mockRunL2Input.mockResolvedValue({ flagged: true, categories: [], error: "L2 API error" });
      mockAdjudicate.mockRejectedValue(new Error("Safeguard down"));

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("test", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.reason).toContain("unavailable");
    });
  });

  describe("screenInput — L0 immediate classifications", () => {
    it("blocks on L0 block", async () => {
      mockRunL0.mockReturnValue({ action: "block", category: "harassment", reason: "L0 flagged" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("bad", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("L0");
    });

    it("crisis on L0 crisis", async () => {
      mockRunL0.mockReturnValue({ action: "crisis", category: "self-harm/crisis", reason: "L0 crisis" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("sad", defaultCtx);

      expect(result.action).toBe("crisis");
      expect(result.layer).toBe("L0");
      expect(result.crisisResources).toBeDefined();
    });
  });

  describe("screenInput — L1 prompt-injection", () => {
    it("blocks on high injection probability", async () => {
      mockRunL1.mockResolvedValue({ injectionProb: 0.95, action: "block" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("inject", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("L1");
    });
  });

  describe("screenInput — L2 critical and crisis", () => {
    it("blocks on sexual/minors (zero-tolerance)", async () => {
      mockRunL1.mockResolvedValue({ injectionProb: 0, action: "pass" });
      mockRunL2Input.mockResolvedValue({
        flagged: true,
        categories: [{ category: "sexual/minors", score: 0.95 }],
      });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("bad", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("L2");
      expect(result.reason).toContain("Zero-tolerance");
    });

    it("crisis on self-harm", async () => {
      mockRunL1.mockResolvedValue({ injectionProb: 0, action: "pass" });
      mockRunL2Input.mockResolvedValue({
        flagged: true,
        categories: [{ category: "self-harm", score: 0.8 }],
      });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("sad", defaultCtx);

      expect(result.action).toBe("crisis");
      expect(result.layer).toBe("L2");
    });
  });

  describe("screenInput — safeguard escalation", () => {
    it("when L2 flagged + safeguard clears → allow", async () => {
      mockRunL2Input.mockResolvedValue({
        flagged: true,
        categories: [{ category: "harassment", score: 0.7 }],
      });
      mockAdjudicate.mockResolvedValue({ action: "allow", reason: "Safeguard cleared", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("borderline", defaultCtx);

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("safeguard");
    });

    it("when L2 flagged + safeguard blocks → block", async () => {
      mockRunL2Input.mockResolvedValue({
        flagged: true,
        categories: [{ category: "harassment", score: 0.7 }],
      });
      mockAdjudicate.mockResolvedValue({ action: "block", reason: "Safeguard flagged", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("borderline", defaultCtx);

      expect(result.action).toBe("block");
      expect(result.layer).toBe("safeguard");
    });

    it("blocks when flagged + recent safety events", async () => {
      mockRunL2Input.mockResolvedValue({
        flagged: true,
        categories: [{ category: "harassment", score: 0.7 }],
      });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("borderline", { ...defaultCtx, recentSafetyEvents: 2 });

      expect(result.action).toBe("block");
      expect(result.reason).toContain("recent safety events");
    });
  });

  describe("screenInput — no flag happy path", () => {
    it("allows when all layers pass", async () => {
      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenInput("safe text", defaultCtx);

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("L0-L2");
    });
  });

  describe("screenOutput — fail-closed", () => {
    it("allows when L3 passes", async () => {
      mockRunL3Output.mockResolvedValue({ flagged: false, categories: [] });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("safe reply");

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("L3");
    });

    it("blocks when L3 flags", async () => {
      mockRunL3Output.mockResolvedValue({
        flagged: true,
        categories: [{ category: "violence", score: 0.5 }],
      });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("violent reply");

      expect(result.action).toBe("block");
      expect(result.safeFallback).toBeDefined();
      expect(result.layer).toBe("L3");
    });

    it("L3 degrades to output safeguard; safeguard clears → allow", async () => {
      mockRunL3Output.mockResolvedValue({ flagged: true, categories: [], error: "L3 API error" });
      mockRunOutputFallback.mockResolvedValue({ action: "allow", reason: "Cleared", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("reply");

      expect(result.action).toBe("allow");
      expect(result.layer).toBe("safeguard");
      expect(result.reason).toContain("cleared by output safeguard fallback");
    });

    it("L3 degrades and output safeguard fails → block with safeFallback", async () => {
      mockRunL3Output.mockResolvedValue({ flagged: true, categories: [], error: "L3 API error" });
      mockRunOutputFallback.mockResolvedValue({ action: "block", reason: "Flagged", confidence: "high" });

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("reply");

      expect(result.action).toBe("block");
      expect(result.safeFallback).toBeDefined();
      expect(result.layer).toBe("safeguard");
    });

    it("L3 degrades and output safeguard errors → block with safeFallback", async () => {
      mockRunL3Output.mockResolvedValue({ flagged: true, categories: [], error: "L3 API error" });
      mockRunOutputFallback.mockRejectedValue(new Error("Safeguard down"));

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("reply");

      expect(result.action).toBe("block");
      expect(result.safeFallback).toBeDefined();
    });

    it("returns block on unexpected L3 throw (safety net)", async () => {
      mockRunL3Output.mockRejectedValue(new Error("L3 crashed unexpectedly"));

      const { createModerator } = await import("../services/moderation/moderation-engine.js");
      const engine = createModerator();
      const result = await engine.screenOutput("reply");

      expect(result.action).toBe("block");
      expect(result.layer).toBe("fail-closed-safety-net");
      expect(result.safeFallback).toBeDefined();
    });
  });
});
