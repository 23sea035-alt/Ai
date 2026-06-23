import { db, memoryJobsTable } from "../../db/src/index.js";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger.js";
import { consolidateMemory } from "../memory/consolidation.js";

const POLL_INTERVAL_MS = 5_000;
const BATCH_SIZE = 5;

let running = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function processPendingJobs(): Promise<void> {
  try {
    const jobs = await db
      .select()
      .from(memoryJobsTable)
      .where(eq(memoryJobsTable.status, "pending"))
      .limit(BATCH_SIZE);

    for (const job of jobs) {
      await consolidateMemory(job.id);
    }

    if (jobs.length > 0) {
      logger.info({ processed: jobs.length }, "Job worker cycle complete");
    }
  } catch (err) {
    logger.error({ err }, "Job worker cycle error");
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
