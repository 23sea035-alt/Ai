import { describe, it, expect, vi, beforeEach } from "vitest";

const mockEnqueueMemoryJob = vi.fn();
const mockRetrieveMemories = vi.fn();
const mockCheckFreeTierLimit = vi.fn();
const mockShouldShowBreakReminder = vi.fn();
const mockAssemblePrompt = vi.fn();
const mockGenerateReply = vi.fn();
const mockScreenInput = vi.fn();
const mockScreenOutput = vi.fn();
const mockBuildCrisisResponse = vi.fn();

vi.mock("../db/src/index.js", () => {
  const resolveTo = (result: unknown) => vi.fn(() => ({ limit: vi.fn(() => Promise.resolve(result)) }));

  const makeChain = (result: unknown) => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: resolveTo(result),
        orderBy: resolveTo(result),
      })),
      orderBy: resolveTo(result),
    })),
    where: vi.fn(() => ({
      limit: resolveTo(result),
    })),
  });

  const txResult = [{ id: "m1", companionId: "c1", userId: "u1", turnId: "t1", role: "user", content: "hello", status: "complete" }];
  const tx = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve(txResult)) })),
    })),
    select: vi.fn(() => {
      const selectResult = [{ isPremium: false, isMinor: false, status: "active" }];
      return {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(selectResult)),
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
      };
    }),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  };

  return {
    db: {
      transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => await cb(tx)),
      select: vi.fn(() => makeChain([])),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([])) })),
      })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    },
    messagesTable: { userId: "user_id", role: "role", createdAt: "created_at" },
    companionsTable: {},
    usersTable: {},
    safetyEventsTable: {},
    deviceTokensTable: {},
  };
});

vi.mock("../services/moderation/index.js", () => ({
  createModerator: vi.fn(() => ({
    screenInput: mockScreenInput,
    screenOutput: mockScreenOutput,
  })),
  buildCrisisResponse: mockBuildCrisisResponse,
}));

vi.mock("../services/llm/index.js", () => ({
  getLLMProvider: vi.fn(() => ({ generateReply: mockGenerateReply })),
}));

vi.mock("../services/memory.js", () => ({
  retrieveMemories: mockRetrieveMemories,
  enqueueMemoryJob: mockEnqueueMemoryJob,
}));

vi.mock("../services/chat/free-tier.js", () => ({
  checkFreeTierLimit: mockCheckFreeTierLimit,
}));

vi.mock("../services/chat/break-reminder.js", () => ({
  shouldShowBreakReminder: mockShouldShowBreakReminder,
}));

vi.mock("../services/chat/prompt-assembler.js", () => ({
  assemblePrompt: mockAssemblePrompt,
  GENERATION_FALLBACK_REPLY: "I'm having trouble responding right now.",
}));

vi.mock("../lib/logger.js", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("../services/notifications/apns.js", () => ({
  sendPushNotification: vi.fn(),
}));

const validInput = {
  userId: "u1",
  companionId: "c1",
  content: "Hello!",
  sessionStartedAt: new Date().toISOString(),
  providedTurnId: "t1",
};

describe("Turn pipeline — memory safety-skip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckFreeTierLimit.mockResolvedValue({ allowed: true });
    mockShouldShowBreakReminder.mockReturnValue({ remind: false });
    mockAssemblePrompt.mockReturnValue({
      systemPrompt: "You are a companion",
      messages: [{ role: "user", content: "Hello!" }],
    });
    mockGenerateReply.mockResolvedValue("Hi there!");
    mockRetrieveMemories.mockResolvedValue([]);
  });

  describe("enqueueMemoryJob IS called", () => {
    it("calls enqueueMemoryJob when input and output pass moderation", async () => {
      mockScreenInput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L0-L2", policyVersion: "1" });
      mockScreenOutput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L3", policyVersion: "1" });

      const { processTurn } = await import("../services/chat/turn-pipeline.js");
      const result = await processTurn(validInput);

      expect(mockEnqueueMemoryJob).toHaveBeenCalledTimes(1);
      expect(result.error).toBeUndefined();
    });

    it("calls enqueueMemoryJob when output is escalated but allowed", async () => {
      mockScreenInput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L0-L2", policyVersion: "1" });
      mockScreenOutput.mockResolvedValue({ action: "allow", categories: [], escalated: true, layer: "safeguard", policyVersion: "1" });

      const { processTurn } = await import("../services/chat/turn-pipeline.js");
      const result = await processTurn(validInput);

      expect(mockEnqueueMemoryJob).toHaveBeenCalledTimes(1);
      expect(result.error).toBeUndefined();
    });
  });

  describe("enqueueMemoryJob is NOT called (safety skip)", () => {
    it("does NOT enqueue memory when output is blocked", async () => {
      mockScreenInput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L0-L2", policyVersion: "1" });
      mockScreenOutput.mockResolvedValue({
        action: "block", categories: [{ category: "violence", score: 0.5 }], escalated: false,
        layer: "L3", policyVersion: "1", safeFallback: "I can't respond to that.",
      });

      const { processTurn } = await import("../services/chat/turn-pipeline.js");
      const result = await processTurn(validInput);

      expect(mockEnqueueMemoryJob).not.toHaveBeenCalled();
      expect(result.error).toBeUndefined();
    });

    it("does NOT enqueue memory when input is blocked", async () => {
      mockScreenInput.mockResolvedValue({ action: "block", categories: [], escalated: false, layer: "L2", policyVersion: "1", reason: "Blocked" });

      const { processTurn } = await import("../services/chat/turn-pipeline.js");
      const result = await processTurn(validInput);

      expect(mockEnqueueMemoryJob).not.toHaveBeenCalled();
      expect(result.error).toBeDefined();
    });

    it("does NOT enqueue memory on crisis path", async () => {
      mockScreenInput.mockResolvedValue({ action: "crisis", categories: [{ category: "self-harm", score: 0.9 }], escalated: false, layer: "L2", policyVersion: "1" });
      mockBuildCrisisResponse.mockReturnValue("Crisis reply");

      const { processTurn } = await import("../services/chat/turn-pipeline.js");
      const result = await processTurn(validInput);

      expect(mockEnqueueMemoryJob).not.toHaveBeenCalled();
      expect(result.safetyFlagged).toBe(true);
    });
  });
});
