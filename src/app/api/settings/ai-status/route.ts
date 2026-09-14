import { NextResponse } from "next/server";
import { getAIProvidersHealth } from "@/lib/ai/provider";

export async function GET() {
  try {
    const health = await getAIProvidersHealth();
    return NextResponse.json(health);
  } catch (error) {
    console.error("Failed to check AI health:", error);
    return NextResponse.json({ error: "Failed to check AI provider health" }, { status: 500 });
  }
}
