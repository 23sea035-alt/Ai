import { Router, type IRouter, type Request, type Response } from "express";
import { HealthCheckResponse } from "@aura/shared";
import { db } from "../db/src/index.js";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.get("/healthz", async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch (err) {
    checks.database = "error";
    logger.error({ err }, "Health check — database failed");
  }

  const overall = Object.values(checks).every((v) => v === "ok") ? "ok" : "degraded";
  const statusCode = overall === "ok" ? 200 : 503;

  const data = HealthCheckResponse.parse({ status: overall, checks });
  res.status(statusCode).json(data);
});

export default router;
