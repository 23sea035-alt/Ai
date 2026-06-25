-- Drop the legacy is_admin flag; admin gating now uses users.role (synced from Clerk public_metadata).
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_admin";
