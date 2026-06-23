import { MODERATION_INPUT_THRESHOLDS, MODERATION_OUTPUT_THRESHOLDS } from "@aura/shared";

export interface OmniCategoryScore {
  category: string;
  score: number;
}

export interface OmniResult {
  flagged: boolean;
  categories: OmniCategoryScore[];
  error?: string;
}

export async function runL2Input(text: string): Promise<OmniResult> {
  try {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      return { flagged: true, categories: [], error: "OPENAI_API_KEY not set" };
    }
    const client = new OpenAI({ apiKey });
    const response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];
    if (!result) {
      return { flagged: true, categories: [], error: "No moderation result" };
    }

    const categories: OmniCategoryScore[] = [];
    const cats = result.categories as unknown as Record<string, boolean>;
    const scores = result.category_scores as unknown as Record<string, number>;
    for (const [key, flagged] of Object.entries(cats)) {
      if (flagged) {
        categories.push({ category: key, score: scores[key] ?? 0 });
      }
    }

    return { flagged: Object.values(cats).some(Boolean), categories };
  } catch (err) {
    return { flagged: true, categories: [], error: `L2 error: ${err instanceof Error ? err.message : "unknown"}` };
  }
}

export async function runL3Output(text: string): Promise<OmniResult> {
  try {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      return { flagged: true, categories: [], error: "OPENAI_API_KEY not set" };
    }
    const client = new OpenAI({ apiKey });
    const response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];
    if (!result) {
      return { flagged: true, categories: [], error: "No moderation result" };
    }

    const categories: OmniCategoryScore[] = [];
    const cats = result.categories as unknown as Record<string, boolean>;
    const scores = result.category_scores as unknown as Record<string, number>;
    for (const [key, flagged] of Object.entries(cats)) {
      if (flagged && (scores[key] ?? 0) >= (MODERATION_OUTPUT_THRESHOLDS[key] ?? 0.5)) {
        categories.push({ category: key, score: scores[key] ?? 0 });
      }
    }

    return { flagged: categories.length > 0, categories };
  } catch (err) {
    return { flagged: true, categories: [], error: `L3 error: ${err instanceof Error ? err.message : "unknown"}` };
  }
}
