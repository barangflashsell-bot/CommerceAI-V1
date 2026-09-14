import { prisma } from "../prisma";

export interface AILogData {
  provider: string;
  model: string;
  operation: string;
  success: boolean;
  latencyMs: number;
  tokens?: number;
  error?: string;
}

export async function logAIRequest(data: AILogData): Promise<void> {
  try {
    await prisma.aiLog.create({
      data: {
        provider: data.provider,
        model: data.model,
        operation: data.operation,
        success: data.success,
        latencyMs: data.latencyMs,
        tokens: data.tokens,
        error: data.error,
      },
    });
  } catch (err) {
    // Non-blocking log failure
    console.error("[AILogger] Failed to save AI log:", err);
  }
}
