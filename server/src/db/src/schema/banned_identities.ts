import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";

export const bannedIdentitiesTable = pgTable("banned_identities", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifierType: text("identifier_type").notNull(),
  identifierHash: text("identifier_hash").notNull(),
  reason: text("reason"),
  sourceUserId: uuid("source_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  identifierTypeHashUnique: { name: "uq_identifier_type_hash", columns: [table.identifierType, table.identifierHash] },
}));

export type BannedIdentity = typeof bannedIdentitiesTable.$inferSelect;
export type NewBannedIdentity = typeof bannedIdentitiesTable.$inferInsert;
