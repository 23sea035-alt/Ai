import rateLimit, { defaultKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import type { AuthRequest } from "../services/auth/clerk.middleware.js";

const PER_MINUTE_WINDOW_MS = 60 * 1000;
const PER_MINUTE_MAX = 30;
const PER_DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const PER_DAY_MAX = 1000;

function keyGenerator(req: Request): string {
  return (req as AuthRequest).userId ?? defaultKeyGenerator(req);
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


