import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import { GeminiProvider } from "./gemini-provider";

let activeProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProvider) return activeProvider;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (geminiKey && geminiKey.trim() !== "") {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    activeProvider = new GeminiProvider(geminiKey, model);
    console.log(`[CommerceAI] Using GeminiProvider (Model: ${model})`);
  } else if (openaiKey && openaiKey.trim() !== "") {
    const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o";
    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    activeProvider = new OpenAIProvider(openaiKey, model, baseUrl);
    console.log(`[CommerceAI] Using OpenAIProvider (Model: ${model})`);
  } else {
    activeProvider = new MockAIProvider();
    console.log("[CommerceAI] Using MockAIProvider (AI ESTIMATED Mode)");
  }

  return activeProvider;
}

export function isUsingMockProvider(): boolean {
  const provider = getAIProvider();
  return provider.isMock;
}

export function resetAIProvider(): void {
  activeProvider = null;
}

export interface ProviderHealth {
  id: "mock" | "openai" | "gemini";
  name: string;
  status: "Connected" | "Not Configured" | "Error";
  model: string;
  type: "AI ESTIMATED" | "LIVE AI";
  active: boolean;
}

export async function getAIProvidersHealth(): Promise<ProviderHealth[]> {
  const current = getAIProvider();
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const mockHealth: ProviderHealth = {
    id: "mock",
    name: "Mock AI Provider",
    status: "Connected",
    model: "mock-v1",
    type: "AI ESTIMATED",
    active: current.isMock,
  };

  const openaiHealth: ProviderHealth = {
    id: "openai",
    name: "OpenAI Provider",
    status: openaiKey && openaiKey.trim() !== "" ? "Connected" : "Not Configured",
    model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o",
    type: "LIVE AI",
    active: current.name === "OpenAIProvider",
  };

  const geminiHealth: ProviderHealth = {
    id: "gemini",
    name: "Gemini Provider",
    status: geminiKey && geminiKey.trim() !== "" ? "Connected" : "Not Configured",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    type: "LIVE AI",
    active: current.name === "GeminiProvider",
  };

  return [mockHealth, openaiHealth, geminiHealth];
}
