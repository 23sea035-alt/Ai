import { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken as clerkVerifyToken } from "@clerk/backend";
import { getEnv } from "../../config/env.js";
import { lookupLocalUser } from "./auth.service.js";

export interface AuthRequest extends Request {
  userId?: string;
  clerkUserId?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = header.slice(7);
    const jwtPayload = await clerkVerifyToken(token, {});

    if (!jwtPayload.sub) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }

    req.clerkUserId = jwtPayload.sub;

    const localUser = await lookupLocalUser(jwtPayload.sub);
    if (!localUser) {
      res.status(404).json({ error: "User not found. Complete registration first." });
      return;
    }

    req.userId = localUser.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = header.slice(7);
    const jwtPayload = await clerkVerifyToken(token, {});

    if (jwtPayload.sub) {
      req.clerkUserId = jwtPayload.sub;
      const localUser = await lookupLocalUser(jwtPayload.sub);
      if (localUser) {
        req.userId = localUser.id;
      }
    }
  } catch {
    // Token verification failed — continue as unauthenticated
  }

  next();
}
