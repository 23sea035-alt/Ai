import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

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

// ── WebSocket streaming chat ─────────────────────────────────────────
try {
  const { WebSocketServer } = await import("ws");
  const jwt = await import("jsonwebtoken");
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  const { getEnv } = await import("./config/env.js");
  const JWT_SECRET = getEnv().SESSION_SECRET;

  wss.on("connection", (ws, req) => {
    logger.info("WebSocket connected");

    // Extract token from query param
    const url = new URL(req.url ?? "", `http://${req.headers.host ?? "localhost"}`);
    const token = url.searchParams.get("token");
    if (!token) {
      ws.send(JSON.stringify({ type: "error", content: "Authentication required" }));
      ws.close();
      return;
    }

    let userId: number;
    try {
      const payload = jwt.default.verify(token, JWT_SECRET) as { userId: number };
      userId = payload.userId;
    } catch {
      ws.send(JSON.stringify({ type: "error", content: "Invalid token" }));
      ws.close();
      return;
    }

      // Import the shared chat pipeline once per connection
      let chatPipeline: typeof import("./routes/chat.js") | null = null;

      ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const { companionId, content, sessionStartedAt } = msg;

        if (!companionId || !content) {
          ws.send(JSON.stringify({ type: "error", content: "companionId and content required" }));
          return;
        }

        // Lazily load chat pipeline module on first message
        if (!chatPipeline) chatPipeline = await import("./routes/chat.js");
        const result = await chatPipeline.processChatTurn(userId, companionId, content, sessionStartedAt);

        if (result.error) {
          ws.send(JSON.stringify({ type: "error", content: result.error, limitReached: result.limitReached }));
          return;
        }

        // Stream the AI response token by token
        const tokens = result.aiMessage.content.split(/(\s+)/);
        for (const tokenText of tokens) {
          ws.send(JSON.stringify({ type: "token", content: tokenText }));
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        ws.send(JSON.stringify({ type: "done", messageId: result.aiMessage.id, safetyFlagged: result.safetyFlagged, memoriesUsed: result.memoriesUsed, breakReminder: result.breakReminder }));
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", content: "Failed to process message" }));
      }
    });

    ws.on("close", () => logger.info("WebSocket disconnected"));
  });
} catch (err) {
  logger.warn({ err }, "WebSocket not available — streaming chat disabled");
}

export { server };
export default app;
