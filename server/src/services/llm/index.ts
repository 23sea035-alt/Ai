export interface LLMProvider {
  generateReply(params: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  }): Promise<string>;
}

let _provider: LLMProvider | null = null;

export function setLLMProvider(provider: LLMProvider): void {
  _provider = provider;
}

export function getLLMProvider(): LLMProvider {
  if (!_provider) throw new Error("LLM provider not configured — set one via setLLMProvider()");
  return _provider;
}
