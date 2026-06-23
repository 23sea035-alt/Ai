import { eq, lte, and, isNotNull } from "drizzle-orm";
import { db, usersTable, messagesTable, companionsTable, memoriesTable, subscriptionsTable, memoryJobsTable, safetyEventsTable, bannedIdentitiesTable } from "../db/src/index.js";
import { logger } from "../lib/logger.js";

const RETENTION_DAYS_MESSAGES = 90;
const RETENTION_DAYS_INACTIVE_ACCOUNTS = 365;
const RETENTION_DAYS_SAFETY_EVENTS = 365;
const RETENTION_DAYS_BANNED_IDENTITIES = 730;
const GRACE_DAYS_SOFT_DELETE = 30;
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

export async function enforceBannedIdentitiesRetention(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS_BANNED_IDENTITIES * MS_PER_DAY);
  logger.info({ cutoff }, "Running banned identities retention enforcement");

  const deleted = await db
    .delete(bannedIdentitiesTable)
    .where(and(
      lte(bannedIdentitiesTable.createdAt, cutoff),
      isNotNull(bannedIdentitiesTable.expiresAt),
    ));

  logger.info({ count: (deleted as any).rowCount ?? 0 }, "Expired banned identities purged");
}

export async function enforceGraceExpiry(): Promise<void> {
  const cutoff = new Date(Date.now() - GRACE_DAYS_SOFT_DELETE * MS_PER_DAY);
  logger.info({ cutoff }, "Running grace-expiry hard purge");

  const expiredUsers = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(
      eq(usersTable.status, "deleted") as any,
      lte(usersTable.deletedAt!, cutoff),
      isNotNull(usersTable.deletedAt),
    ));

  for (const user of expiredUsers) {
    await db.transaction(async (tx) => {
      await tx.delete(memoryJobsTable).where(eq(memoryJobsTable.userId, user.id));
      await tx.delete(messagesTable).where(eq(messagesTable.userId, user.id));
      await tx.delete(memoriesTable).where(eq(memoriesTable.userId, user.id));
      await tx.delete(companionsTable).where(eq(companionsTable.userId, user.id));
      await tx.delete(usersTable).where(eq(usersTable.id, user.id));
    });

    logger.info({ userId: user.id }, "Grace period expired — user hard-purged");
  }

  if (expiredUsers.length > 0) {
    logger.info({ count: expiredUsers.length }, "Grace-expiry hard purge complete");
  }
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

export async function reconcilePremiumStaleness(): Promise<void> {
  const now = new Date();
  logger.info("Running premium staleness reconciliation");

  const expiredSubs = await db
    .select({ id: subscriptionsTable.id, userId: subscriptionsTable.userId })
    .from(subscriptionsTable)
    .where(and(
      lte(subscriptionsTable.expiresAt!, now),
      eq(subscriptionsTable.willRenew, false),
      isNotNull(subscriptionsTable.userId),
    ));

  for (const sub of expiredSubs) {
    await db.update(subscriptionsTable)
      .set({ status: "expired", updatedAt: now })
      .where(eq(subscriptionsTable.id, sub.id));
    await db.update(usersTable)
      .set({ isPremium: false, updatedAt: now })
      .where(eq(usersTable.id, sub.userId!));
  }

  if (expiredSubs.length > 0) {
    logger.info({ count: expiredSubs.length }, "Stale premium subscriptions expired");
  }
}
