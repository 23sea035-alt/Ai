import { db, memoriesTable, memoryJobsTable } from "../db/src/index.js";
import { and, eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { extractKeywords, jaccardSimilarity } from "./memory/keywords.js";

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

export async function enqueueMemoryJob(
  userId: string,
  companionId: string,
  rawContent: string,
): Promise<string | null> {
  try {
    const [job] = await db.insert(memoryJobsTable).values({ userId, companionId, rawContent }).returning();
    logger.info({ jobId: job.id }, "Memory consolidation job enqueued");
    return job.id;
  } catch (err) {
    logger.error({ err }, "Failed to enqueue memory job");
    return null;
  }
}

export async function retrieveMemories(
  userId: string,
  companionId: string,
  query: string,
  limit = 5,
): Promise<Array<{ content: string; importance: number; category: string }>> {
  try {
    const queryTokens = new Set(extractKeywords(query));

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
