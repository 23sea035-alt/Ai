import { readFileSync } from "fs";
import { existsSync } from "fs";
import { createPrivateKey, sign } from "crypto";
import { getEnv } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

let apnsClientInitialized = false;
let cachedAuthToken: string | null = null;
let cachedAuthTokenExpiry = 0;

function ensureApnsClient(): void {
  if (apnsClientInitialized) return;
  const env = getEnv();
  if (!env.APNS_KEY_ID || !env.APNS_TEAM_ID || !env.APNS_KEY_FILE) {
    logger.warn("APNs not configured — push notifications disabled");
    return;
  }

  if (!existsSync(env.APNS_KEY_FILE)) {
    logger.warn({ path: env.APNS_KEY_FILE }, "APNs key file not found — push disabled");
    return;
  }

  apnsClientInitialized = true;
}

function generateAuthToken(): string | null {
  const env = getEnv();
  if (!env.APNS_KEY_ID || !env.APNS_TEAM_ID || !env.APNS_KEY_FILE) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedAuthToken && cachedAuthTokenExpiry > now + 60) return cachedAuthToken;

  try {
    const keyData = readFileSync(env.APNS_KEY_FILE, "utf8");
    const privateKey = createPrivateKey(keyData);

    const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: env.APNS_KEY_ID })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ iss: env.APNS_TEAM_ID, iat: now })).toString("base64url");
    const signingInput = `${header}.${payload}`;

    const signature = sign(null, Buffer.from(signingInput), privateKey);
    const signatureBase64 = signature.toString("base64url");

    cachedAuthToken = `${signingInput}.${signatureBase64}`;
    cachedAuthTokenExpiry = now + 3540;
    return cachedAuthToken;
  } catch (err) {
    logger.error({ err }, "Failed to generate APNs auth token");
    return null;
  }
}

function isProduction(): boolean {
  return getEnv().APNS_ENVIRONMENT === "production";
}

export async function sendPushNotification(
  deviceToken: string,
  payload: { alert: { title: string; body: string }; badge?: number; data?: Record<string, string> },
): Promise<void> {
  ensureApnsClient();
  if (!apnsClientInitialized) {
    logger.debug("APNs not initialized — skipping push");
    return;
  }

  const authToken = generateAuthToken();
  if (!authToken) return;

  const host = isProduction() ? "api.push.apple.com" : "api.sandbox.push.apple.com";
  const url = `https://${host}/3/device/${deviceToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "authorization": `bearer ${authToken}`,
        "apns-topic": "com.auraai.app",
        "apns-push-type": "alert",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        aps: {
          alert: payload.alert,
          badge: payload.badge ?? 1,
          "mutable-content": 1,
        },
        data: payload.data ?? {},
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error({ status: response.status, body }, "APNs push failed");
    }
  } catch (err) {
    logger.error({ err }, "APNs push error");
  }
}
