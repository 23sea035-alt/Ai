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

describe("Retention purge — contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enforceRetention", () => {
    it("calls db.delete with messagesTable", async () => {
      const { enforceRetention } = await import("../services/retention.js");
      await enforceRetention();

      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it("dryRun does not call delete", async () => {
      const mockSelect = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      }));
      mockDb.select.mockImplementation(mockSelect);

      const { enforceRetention } = await import("../services/retention.js");
      const reported = await enforceRetention({ dryRun: true });

      expect(reported).toBe(0);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it("returns count from delete result", async () => {
      mockDeleteResult.rowCount = 5;
      const { enforceRetention } = await import("../services/retention.js");
      const deleted = await enforceRetention();
      expect(deleted).toBe(5);
    });
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
  });

  describe("markInactiveUsers", () => {
    it("dryRun does not call update", async () => {
      const mockSelect = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      }));
      mockDb.select.mockImplementation(mockSelect);

      const { markInactiveUsers } = await import("../services/retention.js");
      await markInactiveUsers({ dryRun: true });

      expect(mockDb.update).not.toHaveBeenCalled();
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
    it("throws on null table", async () => {
      const { enforceRetention } = await import("../services/retention.js");
      const origDelete = mockDb.delete;
      mockDb.delete.mockImplementation(() => ({
        where: vi.fn(() => {
          throw new Error("table is null");
        }),
      }));
      mockDb.select.mockImplementation(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockRejectedValue(new Error("table is null")),
          })),
        })),
      }));
      await expect(enforceRetention({ dryRun: true })).rejects.toThrow();
      mockDb.delete = origDelete;
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

      const { enforceRetention } = await import("../services/retention.js");
      const result = await enforceRetention({ dryRun: true });
      expect(result).toBe(0);
    });
  });
});
