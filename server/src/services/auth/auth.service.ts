import { eq, and, gte, sql } from "drizzle-orm";
import { db, usersTable, bannedIdentitiesTable, safetyEventsTable } from "../../db/src/index.js";
import { hashIdentifier } from "../../lib/crypto.js";
import { logger } from "../../lib/logger.js";
import { FLAGGED_USER_WINDOW_DAYS, FLAGGED_USER_SUSPEND_THRESHOLD } from "@aura/shared";

export async function lookupLocalUser(clerkUserId: string): Promise<typeof usersTable.$inferSelect | null> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  return user ?? null;
}

export async function upsertUserFromClerk(data: {
  clerkUserId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}): Promise<typeof usersTable.$inferSelect> {
  const [user] = await db
    .insert(usersTable)
    .values({
      clerkUserId: data.clerkUserId,
      email: data.email.toLowerCase(),
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role ?? "user",
    })
    .onConflictDoUpdate({
      target: usersTable.clerkUserId,
      set: {
        email: data.email.toLowerCase(),
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: data.role ?? "user",
      },
    })
    .returning();
  return user;
}

export async function deleteUserByClerkId(clerkUserId: string): Promise<void> {
  await db
    .delete(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId));
}

export async function checkBan(email: string): Promise<boolean> {
  const emailHash = hashIdentifier(email.toLowerCase());
  const [match] = await db
    .select()
    .from(bannedIdentitiesTable)
    .where(eq(bannedIdentitiesTable.identifierHash, emailHash))
    .limit(1);
  return !!match;
}

export async function autoSuspendIfNeeded(userId: string): Promise<void> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - FLAGGED_USER_WINDOW_DAYS);

    const [result] = await db
      .select({ eventCount: sql<number>`count(*)::int` })
      .from(safetyEventsTable)
      .where(
        and(
          eq(safetyEventsTable.userId, userId),
          gte(safetyEventsTable.createdAt, cutoff),
        ),
      );

    if (result && result.eventCount >= FLAGGED_USER_SUSPEND_THRESHOLD) {
      await db
        .update(usersTable)
        .set({ status: "suspended", updatedAt: new Date() })
        .where(eq(usersTable.id, userId));
    }
  } catch (err) {
    logger.error({ err, userId }, "Auto-suspend failed");
  }
}
