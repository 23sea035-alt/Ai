import { createHash } from "crypto";
import { getEnv } from "../config/env.js";

export function hashIdentifier(identifier: string): string {
  const pepper = getEnv().BANNED_IDENTITY_PEPPER;
  return createHash("sha256").update(identifier + pepper).digest("hex");
}
