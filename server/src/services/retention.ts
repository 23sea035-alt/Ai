import { eq, lt, lte, and, isNotNull } from "drizzle-orm";
import { db, usersTable, messagesTable, safetyEventsTable } from "../db/src/index.js";
import { logger } from "../lib/logger.js";

const RETENTION_DAYS_MESSAGES = 90;
const RETENTION_DAYS_INACTIVE_ACCOUNTS = 365;
const RETENTION_DAYS_SAFETY_EVENTS = 365;
const MS_PER_DAY = 86_400_000;

export async function enforceRetention(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS_MESSAGES * MS_PER_DAY);
  logger.info({ cutoff }, "Running message retention enforcement");

  const deletedMessages = await db
    .delete(messagesTable)
    .where(lte(messagesTable.createdAt, cutoff));

  logger.info({ count: (deletedMessages as any).rowCount ?? 0 }, "Old messages purged");
}

export async function enforceSafetyEventRetention(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS_SAFETY_EVENTS * MS_PER_DAY);
  logger.info({ cutoff }, "Running safety event retention enforcement");

  const deletedEvents = await db
    .delete(safetyEventsTable)
    .where(lte(safetyEventsTable.createdAt, cutoff));

  logger.info({ count: (deletedEvents as any).rowCount ?? 0 }, "Old safety events purged");
}

export async function markInactiveUsers(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS_INACTIVE_ACCOUNTS * MS_PER_DAY);
  logger.info({ cutoff }, "Marking inactive users");

  const result = await db
    .update(usersTable)
    .set({ status: "inactive", deletedAt: new Date() })
    .where(and(
      lte(usersTable.updatedAt, cutoff),
      eq(usersTable.status, "active") as any,
      isNotNull(usersTable.updatedAt),
    ));

  logger.info({ count: (result as any).rowCount ?? 0 }, "Users marked inactive");
}
