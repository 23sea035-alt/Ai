import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";

import http from "http";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger.js";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";

const env = getEnv();

// ── Sentry ──────────────────────────────────────────────────────────────
if (env.SENTRY_DSN) {
  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 0,
  });
  logger.info("Sentry initialized");
}

const app: Express = express();

// Security headers (CSP, X-Frame-Options, etc.)
app.use(helmet());

// Raw body capture for webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// ── Initialize LLM provider ──────────────────────────────────────────
try {
  const { getEnv } = await import("./config/env.js");
  const { setLLMProvider } = await import("./services/llm/index.js");
  const { createGroqProvider } = await import("./services/llm/groq.js");
  const groqProvider = createGroqProvider(getEnv().GROQ_API_KEY);
  setLLMProvider(groqProvider);
  logger.info("Groq LLM provider initialized");
} catch (err) {
  logger.warn({ err }, "LLM provider failed to initialize — chat will use fallback responses");
}

// ── Start job worker ─────────────────────────────────────────────
try {
  const { startJobWorker } = await import("./services/jobs/worker.js");
  startJobWorker();
  logger.info("Memory consolidation worker started");
} catch (err) {
  logger.warn({ err }, "Job worker failed to start");
}

// ── Start retention enforcement ─────────────────────────────────
try {
  const { enforceRetention, enforceSafetyEventRetention, enforceGraceExpiry, enforceBannedIdentitiesRetention, markInactiveUsers, reconcilePremiumStaleness } = await import("./services/retention.js");
  const runRetention = async () => {
    try {
      await enforceRetention();
      await enforceSafetyEventRetention();
      await enforceGraceExpiry();
      await enforceBannedIdentitiesRetention();
      await markInactiveUsers();
      await reconcilePremiumStaleness();
    } catch (err) {
      logger.error({ err }, "Retention enforcement cycle failed");
    }
  };
  setInterval(runRetention, 60 * 60 * 1000); // hourly
  runRetention(); // first run immediately
} catch (err) {
  logger.warn({ err }, "Retention enforcement failed to start");
}

// WebSocket streaming is removed in v1.0 — Phase 3 of the rebuild.
// Chat uses HTTP POST only. See docs/planning/v1-tasklist.md Phase 3.

// ── Centralized error handler (must be last) ─────────────────────────
app.use(errorHandler);

export { server };
export default app;
