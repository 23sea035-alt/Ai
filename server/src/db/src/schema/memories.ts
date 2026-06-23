import { pgTable, text, boolean, timestamp, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { companionsTable } from "./companions";

export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  companionId: text("companion_id").notNull().references(() => companionsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  importance: real("importance").notNull().default(0.5),
  embedding: text("embedding"),
  sourceMessageId: integer("source_message_id"),
  lastRecalledAt: timestamp("last_recalled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemorySchema = createInsertSchema(memoriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memoriesTable.$inferSelect;
