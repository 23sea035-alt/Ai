import { db, memoryJobsTable } from "../../db/src/index.js";
import { sql } from "drizzle-orm";
import { logger } from "../../lib/logger.js";
import { consolidateMemory } from "../memory/consolidation.js";

const POLL_INTERVAL_MS = 5_000;
const BATCH_SIZE = 5;

let running = false;
let cycleInProgress = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function processPendingJobs(): Promise<void> {
  if (cycleInProgress) return; // never run two cycles concurrently
  cycleInProgress = true;
  try {
    // Atomically CLAIM a batch (pending -> processing) so overlapping cycles or multiple
    // server instances never process the same job twice. FOR UPDATE SKIP LOCKED lets
    // concurrent claimers grab disjoint rows.
    const result = await db.execute(sql`
      UPDATE ${memoryJobsTable} SET status = 'processing'
      WHERE id IN (
        SELECT id FROM ${memoryJobsTable}
        WHERE status = 'pending'
        ORDER BY created_at
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id
    `);
    const rows = result.rows as Array<{ id: string }>;

    for (const row of rows) {
      await consolidateMemory(row.id);
    }

    if (rows.length > 0) {
      logger.info({ processed: rows.length }, "Job worker cycle complete");
    }
  } catch (err) {
    logger.error({ err }, "Job worker cycle error");
  } finally {
    cycleInProgress = false;
  }
}

export function startJobWorker(): void {
  if (running) return;
  running = true;
  logger.info({ intervalMs: POLL_INTERVAL_MS }, "Job worker started");
  intervalHandle = setInterval(processPendingJobs, POLL_INTERVAL_MS);
  processPendingJobs();
}

export function stopJobWorker(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  running = false;
  logger.info("Job worker stopped");
}
