import { validateEnv, getEnv } from "./config/env.js";
import app, { server } from "./app.js";
import { logger } from "./lib/logger.js";
import { stopJobWorker } from "./services/jobs/worker.js";
import { db } from "./db/src/index.js";

validateEnv();

const env = getEnv();
server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Server listening");
});

// ── Graceful shutdown ──────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down gracefully");

  stopJobWorker();

  try {
    await db.$client.end();
  } catch (err) {
    logger.error({ err }, "Error closing database connection");
  }

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
