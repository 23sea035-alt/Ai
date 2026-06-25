-- Track the latest processed RevenueCat event timestamp so stale / replayed / out-of-order
-- webhook events can be rejected instead of overwriting newer subscription state.
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "last_event_timestamp_ms" bigint;
