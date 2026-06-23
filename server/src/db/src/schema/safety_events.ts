import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";
import { companionsTable } from "./companions.js";
import { messagesTable } from "./messages.js";

export const safetyEventsTable = pgTable("safety_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  companionId: uuid("companion_id").references(() => companionsTable.id, { onDelete: "set null" }),
  messageId: uuid("message_id").references(() => messagesTable.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  source: text("source").notNull(),
  category: text("category"),
  model: text("model"),
  severity: text("severity").notNull().default("info"),
  detail: text("detail"),
  flaggedContent: text("flagged_content"),
  status: text("status").notNull().default("open"),
  action: text("action"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SafetyEvent = typeof safetyEventsTable.$inferSelect;
export type NewSafetyEvent = typeof safetyEventsTable.$inferInsert;
