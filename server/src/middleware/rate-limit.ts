import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import type { AuthRequest } from "../services/auth/clerk.middleware.js";

const PER_MINUTE_WINDOW_MS = 60 * 1000;
const PER_MINUTE_MAX = 30;
const PER_DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const PER_DAY_MAX = 1000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX = 20;
const WEBHOOK_WINDOW_MS = 60 * 1000;
const WEBHOOK_MAX = 120;

function ipKey(req: Request): string {
  return ipKeyGenerator(req.ip ?? "0.0.0.0");
}

function keyGenerator(req: Request): string {
  return (req as AuthRequest).userId ?? ipKey(req);
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

// Brute-force protection for unauthenticated/auth routes (keyed by IP).
export const authBruteForceLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many attempts — please try again later.", code: "RATE_LIMITED" });
  },
});

// Coarse limiter for webhook endpoints (keyed by IP) — abuse/DoS backstop on top of signature checks.
export const webhookLimiter = rateLimit({
  windowMs: WEBHOOK_WINDOW_MS,
  max: WEBHOOK_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests.", code: "RATE_LIMITED" });
  },
});

// Baseline per-IP limiter for all /api traffic — restores the global limiter that was
// dropped during the refactor.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  // Webhooks (from provider IPs, with their own limiter + signature checks) are exempt so a
  // provider's bursts can't collectively throttle real users through the per-IP limiter.
  skip: (req: Request) => req.path.startsWith("/webhooks") || req.path.startsWith("/payments/webhook"),
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests — please slow down.", code: "RATE_LIMITED" });
  },
});


