import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger.js";
import { getEnv } from "./config/env.js";

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

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
});
app.use("/api", limiter);

// Raw body for Stripe webhook
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString();
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

// WebSocket streaming is removed in v1.0 — Phase 3 of the rebuild.
// Chat uses HTTP POST only. See docs/v1-tasklist.md Phase 3.

// ── Sentry error handler (must be last) ──────────────────────────────
// Sentry auto-instruments Express in v9 — no explicit handler needed.
// Errors bubble to the generic error handler below.

export { server };
export default app;
