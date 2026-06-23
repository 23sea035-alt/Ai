import { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";
import { getEnv } from "../../config/env.js";
import { lookupLocalUser } from "./auth.service.js";

let clerk: ReturnType<typeof createClerkClient> | null = null;

function getClerk() {
  if (!clerk) {
    clerk = createClerkClient({ secretKey: getEnv().CLERK_SECRET_KEY });
  }
  return clerk;
}

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
    const session = await getClerk().sessions.verifySession({
      sessionToken: token,
    });

    if (!session) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }

    req.clerkUserId = session.userId;

    const localUser = await lookupLocalUser(session.userId);
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
    const session = await getClerk().sessions.verifySession({
      sessionToken: token,
    });

    if (session) {
      req.clerkUserId = session.userId;
      const localUser = await lookupLocalUser(session.userId);
      if (localUser) {
        req.userId = localUser.id;
      }
    }
  } catch {
    // Session verification failed — continue as unauthenticated
  }

  next();
}
