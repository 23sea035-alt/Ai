import rateLimit from "express-rate-limit";
import { Request } from "express";

const PER_MINUTE_WINDOW_MS = 60 * 1000;
const PER_MINUTE_MAX = 30;
const PER_DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const PER_DAY_MAX = 1000;

function keyGenerator(req: Request): string {
  return (req as any).userId ?? req.ip ?? "unknown";
}

export const chatPerMinuteLimiter = rateLimit({
  windowMs: PER_MINUTE_WINDOW_MS,
  max: PER_MINUTE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests — please slow down.", code: "RATE_LIMITED" });
  },
});

export const chatDailyHardCap = rateLimit({
  windowMs: PER_DAY_WINDOW_MS,
  max: PER_DAY_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (_req, res) => {
    res.status(429).json({ error: "Daily message cap reached. Please try again tomorrow.", code: "DAILY_CAP" });
  },
});

export const authBruteForceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts — please try again later.", code: "AUTH_RATE_LIMIT" },
});

// Webhooks bypass rate limiting (verified by signature)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
