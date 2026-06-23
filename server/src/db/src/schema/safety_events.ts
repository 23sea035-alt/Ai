import { pgTable, text, boolean, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const safetyEventsTable = pgTable("safety_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  detail: text("detail"),
  flaggedContent: text("flagged_content"),
  severity: text("severity").notNull().default("info"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSafetyEventSchema = createInsertSchema(safetyEventsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSafetyEvent = z.infer<typeof insertSafetyEventSchema>;
export type SafetyEvent = typeof safetyEventsTable.$inferSelect;
