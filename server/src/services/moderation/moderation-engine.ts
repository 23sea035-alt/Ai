import type { Moderator, InputVerdict, OutputVerdict, UserContext } from "./moderator.js";
import { runL0 } from "./deterministic.js";
import { runL1 } from "./prompt-guard.js";
import { runL2Input, runL3Output } from "./openai-omni.js";
import type { OmniCategoryScore, OmniResult } from "./openai-omni.js";
import type { PromptGuardResult } from "./prompt-guard.js";
import { adjudicate } from "./safeguard.js";
import { SAFE_FALLBACK_REPLY } from "@aura/shared";
import { buildCrisisResponse } from "./crisis.js";

const POLICY_VERSION = "2026-06-23-001";

export class ModerationEngine implements Moderator {
  async screenInput(text: string, ctx: UserContext): Promise<InputVerdict> {
    const l0 = runL0(text);
    if (l0.action === "block") {
      return {
        action: "block", categories: [{ category: l0.category ?? "unknown", score: 1 }],
        escalated: false, layer: "L0", policyVersion: POLICY_VERSION, reason: l0.reason,
      };
    }
    if (l0.action === "crisis") {
      return {
        action: "crisis", categories: [{ category: l0.category ?? "self-harm/crisis", score: 1 }],
        escalated: false, layer: "L0", policyVersion: POLICY_VERSION,
        crisisResources: ["988 Suicide & Crisis Lifeline: Call or text 988 (US)"],
        reason: l0.reason,
      };
    }

    let l1Action: "pass" | "escalate" | "block" = "pass";
    let l1Category: string | undefined;
    let l2Categories: string[] = [];

    const [l1Result, l2Result] = await Promise.all([
      runL1(text).catch((): PromptGuardResult => ({ injectionProb: 1, action: "block", error: "L1 failed" })),
      runL2Input(text).catch((): OmniResult => ({ flagged: true, categories: [], error: "L2 failed" })),
    ]);

    if (l1Result.action === "block") {
      return {
        action: "block", categories: [{ category: "injection", score: l1Result.injectionProb }],
        escalated: false, layer: "L1", policyVersion: POLICY_VERSION, reason: "Injection blocked by prompt-guard",
      };
    }
    l1Category = l1Result.action === "escalate" ? "injection" : undefined;

    if (l2Result.error) {
      return {
        action: "block", categories: [],
        escalated: false, layer: "L2", policyVersion: POLICY_VERSION, reason: `L2 error: ${l2Result.error}`,
      };
    }

    const criticalCat = l2Result.categories.find(c => c.category === "sexual/minors");
    if (criticalCat) {
      return {
        action: "block", categories: l2Result.categories,
        escalated: false, layer: "L2", policyVersion: POLICY_VERSION, reason: "Zero-tolerance: sexual/minors",
      };
    }

    const crisisCat = l2Result.categories.find(c => c.category.startsWith("self-harm"));
    if (crisisCat) {
      return {
        action: "crisis", categories: l2Result.categories,
        escalated: false, layer: "L2", policyVersion: POLICY_VERSION,
        crisisResources: ["988 Suicide & Crisis Lifeline: Call or text 988 (US)"],
      };
    }

    l2Categories = l2Result.categories.map(c => c.category);

    if (l2Result.flagged || l1Result.action === "escalate") {
      if (ctx.recentSafetyEvents && ctx.recentSafetyEvents > 0) {
        return {
          action: "block", categories: l2Result.categories,
          escalated: false, layer: "L2", policyVersion: POLICY_VERSION,
          reason: "Blocked: recent safety events + escalated classification",
        };
      }

      const safeguardVerdict = await adjudicate(text, l1Category, l2Categories);
      return {
        action: safeguardVerdict.action,
        categories: l2Result.categories,
        escalated: true,
        layer: "safeguard",
        policyVersion: POLICY_VERSION,
        reason: safeguardVerdict.reason,
      };
    }

    return {
      action: "allow", categories: [], escalated: false, layer: "L0-L2",
      policyVersion: POLICY_VERSION,
    };
  }

  async screenOutput(text: string): Promise<OutputVerdict> {
    const l3 = await runL3Output(text);
    if (l3.error) {
      return {
        action: "block", categories: [], escalated: false,
        layer: "L3", policyVersion: POLICY_VERSION,
        safeFallback: SAFE_FALLBACK_REPLY, reason: `L3 error: ${l3.error}`,
      };
    }
    if (l3.flagged) {
      return {
        action: "block", categories: l3.categories, escalated: false,
        layer: "L3", policyVersion: POLICY_VERSION,
        safeFallback: SAFE_FALLBACK_REPLY,
      };
    }
    return {
      action: "allow", categories: [], escalated: false,
      layer: "L3", policyVersion: POLICY_VERSION,
    };
  }
}

let instance: ModerationEngine | null = null;

export function createModerator(): ModerationEngine {
  if (!instance) instance = new ModerationEngine();
  return instance;
}
