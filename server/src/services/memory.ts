import { db, memoriesTable } from "../db/src/index.js";
import { and, eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const STOP_WORDS = new Set([
  "a","an","the","i","you","he","she","it","we","they","me","him","her","us","them",
  "my","your","his","its","our","their","mine","yours","hers","ours","theirs",
  "this","that","these","those","is","am","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","shall","should","may","might",
  "can","could","must","need","dare","ought","used","to","of","in","for","on","with",
  "at","by","from","as","into","through","during","before","after","above","below",
  "between","out","off","over","under","again","further","then","once","here","there",
  "when","where","why","how","all","each","every","both","few","more","most","some",
  "any","no","nor","not","only","own","same","so","than","too","very","just",
  "because","but","and","or","if","while","about","up","what","which","who","whom",
  "whose","whether","since","until","although","though","yet","still","else",
  "like","really","actually","basically","literally","quite","well","also",
]);

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().split(/\s+/);
  const tokens = new Set<string>();
  for (const w of words) {
    const clean = w.replace(/[^a-z0-9']/g, "");
    if (clean.length > 2 && !STOP_WORDS.has(clean)) {
      tokens.add(clean);
    }
  }
  return tokens;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function extractKeywords(text: string): string[] {
  return Array.from(tokenize(text));
}

const FACT_PATTERNS = [
  { regex: /I (?:am|feel|like|love|hate|enjoy|prefer|want|need|have|don't like|can't stand)\s+(.+?)(?:\.|,|!|\?|$)/i, category: "preference" },
  { regex: /my (\w+) (?:is|are)\s+(.+?)(?:\.|,|!|\?|$)/i, category: "attribute" },
  { regex: /I have (?:a|an) (\w+) named\s+(.+?)(?:\.|,|!|\?|$)/i, category: "relationship" },
  { regex: /I (?:work|study|volunteer) (?:at|for)\s+(.+?)(?:\.|,|!|\?|$)/i, category: "work" },
  { regex: /I (?:'m from|am from|live in|was born in)\s+(.+?)(?:\.|,|!|\?|$)/i, category: "location" },
  { regex: /my name (?:is|'s)\s+(.+?)(?:\.|,|!|\?|$)/i, category: "identity" },
];

export function extractFacts(userMessage: string): Array<{ content: string; category: string; importance: number }> {
  const facts: Array<{ content: string; category: string; importance: number }> = [];
  for (const { regex, category } of FACT_PATTERNS) {
    const match = regex.exec(userMessage);
    if (match && match[1]) {
      const factContent = match[1].trim();
      if (factContent.length > 3 && factContent.length < 200) {
        facts.push({
          content: factContent,
          category,
          importance: category === "identity" || category === "relationship" ? 0.9 : 0.6,
        });
      }
    }
  }
  return facts;
}

export async function storeMemory(
  userId: string,
  companionId: string,
  content: string,
  category: string,
  importance: number,
  sourceMessageId?: string,
): Promise<void> {
  try {
    const keywords = extractKeywords(content);
    await db.insert(memoriesTable).values({
      userId,
      companionId,
      content,
      category,
      importance,
      keywords,
      sourceMessageId: sourceMessageId ?? null,
    });
    logger.info({ userId, companionId, category }, "Memory stored");
  } catch (err) {
    logger.error({ err }, "Failed to store memory");
  }
}

export async function retrieveMemories(
  userId: string,
  companionId: string,
  query: string,
  limit = 5,
): Promise<Array<{ content: string; importance: number; category: string }>> {
  try {
    const queryTokens = tokenize(query);

    const allMemories = await db
      .select()
      .from(memoriesTable)
      .where(
        and(
          eq(memoriesTable.userId, userId),
          eq(memoriesTable.companionId, companionId),
        )
      )
      .orderBy(desc(memoriesTable.importance))
      .limit(50);

    interface ScoredMemory { content: string; importance: number; category: string; score: number }
    const scored: ScoredMemory[] = allMemories.map((m) => {
      let similarity = 0;
      if (m.keywords && m.keywords.length > 0) {
        const memTokens = new Set(m.keywords);
        similarity = jaccardSimilarity(queryTokens, memTokens);
      }
      return {
        content: m.content,
        importance: m.importance,
        category: m.category,
        score: similarity * 0.7 + m.importance * 0.3,
      };
    });

    scored.sort((a: ScoredMemory, b: ScoredMemory) => b.score - a.score);
    const top = scored.slice(0, limit);

    if (top.length > 0) {
      const topContent: string[] = top.map((t: ScoredMemory) => t.content);
      for (const m of allMemories) {
        if (topContent.includes(m.content)) {
          await db.update(memoriesTable)
            .set({ lastRecalledAt: new Date() })
            .where(eq(memoriesTable.id, m.id));
        }
      }
    }

    return top.map((t: ScoredMemory) => ({ content: t.content, importance: t.importance, category: t.category }));
  } catch (err) {
    logger.error({ err }, "Failed to retrieve memories");
    return [];
  }
}
