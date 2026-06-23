import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("incomplete"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
