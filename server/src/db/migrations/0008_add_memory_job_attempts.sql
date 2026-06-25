-- Track consolidation attempts so transiently-failed jobs can be retried a bounded number
-- of times instead of being dropped permanently on the first error.
ALTER TABLE "memory_jobs" ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0;
