import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDeleteResult = { rowCount: 0 };
const mockDb = {
  delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(mockDeleteResult) })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue([]),
      })),
    })),
  })),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue({ rowCount: 0 }) })) })),
  transaction: vi.fn((cb: any) => cb({ delete: vi.fn(() => ({ where: vi.fn() })) })),
};

vi.mock("../db/src/index.js", () => ({
  db: mockDb,
  usersTable: {},
  messagesTable: {},
  companionsTable: {},
  memoriesTable: {},
  subscriptionsTable: {},
  memoryJobsTable: {},
  safetyEventsTable: {},
  bannedIdentitiesTable: {},
}));

// NOTE: enforceRetention() (global 90-day message purge) and markInactiveUsers() were REMOVED —
// retention is account-deletion-only (data-retention-policy.md). The remaining purges are exercised below.
describe("Retention purge — contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enforceSafetyEventRetention", () => {
    it("deletes safety events older than cutoff", async () => {
      const { enforceSafetyEventRetention } = await import("../services/retention.js");
      await enforceSafetyEventRetention();

      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it("dryRun does not call delete", async () => {
      const { enforceSafetyEventRetention } = await import("../services/retention.js");
      await enforceSafetyEventRetention({ dryRun: true });

      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it("returns count from delete result", async () => {
      mockDeleteResult.rowCount = 5;
      const { enforceSafetyEventRetention } = await import("../services/retention.js");
      const deleted = await enforceSafetyEventRetention();
      expect(deleted).toBe(5);
    });
  });

  describe("reconcilePremiumStaleness", () => {
    it("dryRun does not call update", async () => {
      const mockSelect = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValue([]),
        })),
      }));
      mockDb.select.mockImplementation(mockSelect);

      const { reconcilePremiumStaleness } = await import("../services/retention.js");
      await reconcilePremiumStaleness({ dryRun: true });

      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteWhere guards", () => {
    it("propagates errors from the underlying query", async () => {
      mockDb.select.mockImplementation(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockRejectedValue(new Error("table is null")),
          })),
        })),
      }));
      const { enforceSafetyEventRetention } = await import("../services/retention.js");
      await expect(enforceSafetyEventRetention({ dryRun: true })).rejects.toThrow();
    });

    it("dry-run with no candidates returns 0", async () => {
      const mockSelect = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      }));
      mockDb.select.mockImplementation(mockSelect);

      const { enforceSafetyEventRetention } = await import("../services/retention.js");
      const result = await enforceSafetyEventRetention({ dryRun: true });
      expect(result).toBe(0);
    });
  });
});
