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
    db: { transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => await cb(tx)) },
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
  GENERATION_FALLBACK_REPLY: "fallback",
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

describe("Turn pipeline — turn_id retry", () => {
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
    mockScreenInput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L0-L2", policyVersion: "1" });
    mockScreenOutput.mockResolvedValue({ action: "allow", categories: [], escalated: false, layer: "L3", policyVersion: "1" });
  });

  it("retries with new turnId on unique violation", async () => {
    const mod = await import("../db/src/index.js");
    const db = (mod as any).db;
    let callCount = 0;
    db.transaction = vi.fn(async (cb: (t: unknown) => Promise<unknown>) => {
      callCount++;
      if (callCount === 1) {
        const err = new Error("duplicate key value violates unique constraint 'uq_turn_id_role'");
        (err as any).code = "23505";
        throw err;
      }
      return await cb({
        insert: vi.fn(() => ({
          values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: "m1" }])) })),
        })),
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([{ isPremium: false, isMinor: false, status: "active" }])),
              orderBy: vi.fn(() => Promise.resolve([])),
            })),
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
        })),
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
      });
    });

    const { processTurn } = await import("../services/chat/turn-pipeline.js");
    const result = await processTurn(validInput);

    expect(result.error).toBeUndefined();
    expect(callCount).toBe(2);
  });

  it("throws after max retries exhausted", async () => {
    const mod = await import("../db/src/index.js");
    const db = (mod as any).db;
    db.transaction = vi.fn(async () => {
      const err = new Error("duplicate key value violates unique constraint 'uq_turn_id_role'");
      (err as any).code = "23505";
      throw err;
    });

    const { processTurn } = await import("../services/chat/turn-pipeline.js");
    await expect(processTurn(validInput)).rejects.toThrow("Turn processing failed after max retries");
  });
});
