import OpenAI from "openai";
import type { LLMProvider } from "./index.js";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

export function createGroqProvider(apiKey: string, model = DEFAULT_MODEL): LLMProvider {
  const client = new OpenAI({ baseURL: GROQ_BASE_URL, apiKey, timeout: 5000 });

  return {
    async generateReply({ systemPrompt, messages }) {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
        temperature: 0.8,
        max_tokens: 512,
      });

      return completion.choices[0]?.message?.content?.trim() ?? "";
    },
  };
}
