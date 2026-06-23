import { pgTable, text, boolean, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";

export const companionsTable = pgTable("companions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  personaKey: text("persona_key").notNull(),
  name: text("name").notNull(),
  traits: jsonb("traits").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  lastMessage: text("last_message"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Companion = typeof companionsTable.$inferSelect;
export type NewCompanion = typeof companionsTable.$inferInsert;
