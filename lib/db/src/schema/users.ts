import { pgTable, text, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  isMinor: boolean("is_minor").notNull().default(false),
  ageVerified: boolean("age_verified").notNull().default(false),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  aiDisclosureAccepted: boolean("ai_disclosure_accepted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
