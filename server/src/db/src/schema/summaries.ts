import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companionsTable } from "./companions";

export const summariesTable = pgTable("summaries", {
  id: serial("id").primaryKey(),
  companionId: text("companion_id").notNull().references(() => companionsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  summaryText: text("summary_text").notNull(),
  coversUntilMessageId: integer("covers_until_message_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSummarySchema = createInsertSchema(summariesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summariesTable.$inferSelect;
