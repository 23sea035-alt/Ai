import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth"),
  ageAssuranceMethod: text("age_assurance_method").notNull().default("self_declared"),
  ageVerified: boolean("age_verified").notNull().default(false),
  ageVerifiedAt: timestamp("age_verified_at", { withTimezone: true }),
  isMinor: boolean("is_minor").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  status: text("status").notNull().default("active"),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  aiDisclosureAccepted: boolean("ai_disclosure_accepted").notNull().default(false),
  tosAcceptedVersion: text("tos_accepted_version"),
  tosAcceptedAt: timestamp("tos_accepted_at", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
