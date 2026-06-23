import { eq } from "drizzle-orm";
import { db, usersTable, bannedIdentitiesTable } from "../../db/src/index.js";
import { hashIdentifier } from "../../lib/crypto.js";

export async function lookupLocalUser(clerkUserId: string) {
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
}) {
  const [user] = await db
    .insert(usersTable)
    .values({
      clerkUserId: data.clerkUserId,
      email: data.email.toLowerCase(),
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
    })
    .onConflictDoUpdate({
      target: usersTable.clerkUserId,
      set: {
        email: data.email.toLowerCase(),
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
      },
    })
    .returning();
  return user;
}

export async function deleteUserByClerkId(clerkUserId: string) {
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
