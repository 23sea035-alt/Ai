import { pgTable, text, boolean, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const companionsTable = pgTable("companions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  persona: text("persona").notNull().default(""),
  traits: jsonb("traits").notNull().default([]).$type<string[]>(),
  colorFrom: text("color_from").notNull().default("#c9bfff"),
  colorTo: text("color_to").notNull().default("#8fd8ff"),
  lastMessage: text("last_message"),
  lastActive: text("last_active"),
  messageCount: integer("message_count").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompanionSchema = createInsertSchema(companionsTable).omit({
  createdAt: true,
});

export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type Companion = typeof companionsTable.$inferSelect;
