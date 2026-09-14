import type {
  AIProvider,
  ProductAnalysisInput,
  ProductAnalysisResult,
  ContentGenerationInput,
  ContentGenerationResult,
  StoryboardInput,
  StoryboardResult,
  VideoPromptResult,
  PerformanceData,
  PerformanceAnalysisResult,
  RecommendationResult,
  HookItem,
  AngleItem,
  AggregatedPerformanceData,
  WinningPatternResult,
  DataSufficiencyResult,
  AIInsightResult,
  NextContentResult,
} from "./types";
import { logAIRequest } from "./logger";
import { generateNextContentRecommendations } from "./engine/next-content";

export class OpenAIProvider implements AIProvider {
  name = "OpenAIProvider";
  isMock = false;

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string = "gpt-4o", baseUrl: string = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async chat(systemPrompt: string, userPrompt: string, retries: number = 1): Promise<any> {
    const start = Date.now();
    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI API Error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("Empty response from OpenAI API");

        const parsed = JSON.parse(content);

        await logAIRequest({
          provider: this.name,
          model: this.model,
          operation: "chat",
          success: true,
          latencyMs: Date.now() - start,
          tokens: data.usage?.total_tokens,
        });

        return parsed;
      } catch (err: any) {
        lastError = err;
        if (attempt === retries) {
          await logAIRequest({
            provider: this.name,
            model: this.model,
            operation: "chat",
            success: false,
            latencyMs: Date.now() - start,
            error: err.message,
          });
          throw err;
        }
      }
    }
    throw lastError;
  }

  async analyzeProduct(input: ProductAnalysisInput): Promise<ProductAnalysisResult> {
    const system = `Kamu adalah AI Commerce Analyst ahli affiliate marketing Indonesia. Analisis produk dan hasilkan format JSON persis sesuai schema berikut:
{
  "opportunityScore": number (0-100),
  "breakdown": {
    "demandPotential": number (0-100),
    "contentPotential": number (0-100),
    "problemSolutionStrength": number (0-100),
    "purchaseIntent": number (0-100),
    "commissionAttractiveness": number (0-100),
    "competitionRisk": number (0-100)
  },
  "reasoning": string,
  "targetAudience": string[],
  "painPoints": string[],
  "buyingTriggers": string[],
  "sellingProposition": string,
  "contentAngles": [{"name": string, "description": string, "score": number, "reason": string}],
  "whyPromote": string
}`;
    const user = `Produk: ${input.name} | Kategori: ${input.category} | Harga: Rp${input.price} | Komisi: ${input.commissionRate}% | Target: ${input.targetAudience} | Deskripsi: ${input.description} | Keunggulan: ${input.advantages} | Solusi Masalah: ${input.problemSolved}`;
    return await this.chat(system, user);
  }

  async generateHooks(input: { productName: string; problemSolved: string; targetAudience: string }): Promise<HookItem[]> {
    const system = `Hasilkan array 5 hook video affiliate TikTok/Reels dalam format JSON: {"hooks": [{"id": number, "text": string, "type": string, "strength": "Tinggi" | "Sedang"}]}`;
    const user = `Produk: ${input.productName} | Masalah: ${input.problemSolved} | Target: ${input.targetAudience}`;
    const res = await this.chat(system, user);
    return res.hooks || [];
  }

  async generateAngles(input: { productName: string; description: string; problemSolved: string }): Promise<AngleItem[]> {
    const system = `Hasilkan array 4 marketing angle dalam format JSON: {"angles": [{"id": number, "name": string, "description": string, "targetEmotion": string, "score": number}]}`;
    const user = `Produk: ${input.productName} | Deskripsi: ${input.description} | Masalah: ${input.problemSolved}`;
    const res = await this.chat(system, user);
    return res.angles || [];
  }

  async generateContentStrategy(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    const system = `Buat strategi konten video affiliate 10 detik dalam format JSON:
{
  "hooks": [{"id": number, "text": string, "type": string, "strength": string}],
  "angles": [{"id": number, "name": string, "description": string, "targetEmotion": string, "score": number}],
  "concepts": [{"id": number, "title": string, "description": string, "hook": string, "angle": string, "flow": string, "expectedImpact": string}],
  "bestConcept": {"index": number, "reason": string}
}`;
    const user = `Produk: ${input.productName} | Platform: ${input.platform} | Durasi: ${input.duration} | Style: ${input.style} | Masalah: ${input.problemSolved} | Keunggulan: ${input.productAdvantages}`;
    return await this.chat(system, user);
  }

  async generateContent(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    return this.generateContentStrategy(input);
  }

  async generateStoryboard(input: StoryboardInput): Promise<StoryboardResult> {
    const system = `Buat storyboard video 4 adegan 10 detik dalam format JSON:
{
  "scenes": [{"sceneNumber": number, "timeRange": string, "visual": string, "camera": string, "action": string, "purpose": string}],
  "productConsistencyRules": string[],
  "totalDuration": "10 detik"
}`;
    const user = `Produk: ${input.productName} | Konsep: ${input.concept.title} (${input.concept.description}) | Style: ${input.style}`;
    return await this.chat(system, user);
  }

  async generateVideoPrompt(storyboard: StoryboardResult, input: StoryboardInput): Promise<VideoPromptResult> {
    const system = `Buat prompt JSON video AI siap pakai:
{
  "duration": "10 seconds",
  "aspect_ratio": "9:16",
  "style": string,
  "product_consistency": {"reference_image": true, "preserve_exact_product": true, "do_not_redesign": true},
  "scenes": [{"time": string, "visual": string, "camera": string, "action": string, "lighting": string}],
  "negative_prompt": string[]
}`;
    const user = `Produk: ${input.productName} | Storyboard: ${JSON.stringify(storyboard.scenes)}`;
    return await this.chat(system, user);
  }

  async analyzePerformance(data: PerformanceData[]): Promise<PerformanceAnalysisResult> {
    const system = `Kamu adalah AI Analyst. Analisis data performa affiliate dan hasilkan JSON:
{
  "bestProduct": {"name": string, "reason": string},
  "bestHook": {"text": string, "reason": string},
  "bestAngle": {"name": string, "reason": string},
  "bestVideoType": {"type": string, "reason": string},
  "bestPlatform": {"name": string, "reason": string},
  "highestCTR": {"content": string, "value": number},
  "highestCVR": {"content": string, "value": number},
  "highestOrder": {"content": string, "value": number},
  "highViewsLowConversion": [{"content": string, "views": number, "cvr": number}],
  "lowViewsHighConversion": [{"content": string, "views": number, "cvr": number}],
  "whatWorked": string[],
  "whatFailed": string[],
  "why": string[],
  "nextActions": string[]
}`;
    const user = `Data performa historis: ${JSON.stringify(data)}`;
    return await this.chat(system, user);
  }

  async generateNextContent(
    winningPatterns: WinningPatternResult,
    aggregated: AggregatedPerformanceData
  ): Promise<NextContentResult> {
    try {
      const system = `Kamu adalah Decision Engine Affiliate. Hasilkan 5 rekomendasi konsep konten berikutnya dalam format JSON:
{
  "concepts": [
    {
      "title": string,
      "reason": string,
      "hook": string,
      "angle": string,
      "concept": string,
      "expectedGoal": string,
      "basedOnPattern": string
    }
  ],
  "strategySummary": string
}`;
      const user = `Pola Pemenang: ${JSON.stringify(winningPatterns)} | Agregasi: ${JSON.stringify(aggregated.account)}`;
      return await this.chat(system, user);
    } catch {
      return generateNextContentRecommendations(winningPatterns, aggregated);
    }
  }

  async generateInsights(
    aggregated: AggregatedPerformanceData,
    patterns: WinningPatternResult,
    sufficiency: DataSufficiencyResult
  ): Promise<AIInsightResult> {
    const nextContent = await this.generateNextContent(patterns, aggregated);
    const priorityProduct = patterns.winningProduct?.name || "Produk Pilihan";

    return {
      sufficiency,
      wins: patterns,
      whatWorked: [
        patterns.winningAngle ? `Angle "${patterns.winningAngle.name}" menghasilkan CVR tertinggi.` : "Angle problem-solution memimpin.",
        patterns.winningHook ? `Hook "${patterns.winningHook.text}" mencatatkan stop rate tertinggi.` : "Hook curiosity efektif.",
      ],
      whatFailed: patterns.losses.map((l) => l.reason),
      why: [
        "Audiens media sosial membutuhkan pembuktian visual cepat dalam 2 detik pertama.",
        "Konten dengan CTA langsung mengonversi view pasif menjadi pembeli aktif.",
      ],
      opportunities: patterns.opportunities,
      nextActions: [
        `Prioritaskan produksi konten untuk ${priorityProduct}.`,
        "Perbaiki CTA pada video bertrafik tinggi.",
      ],
      recommendation: {
        priorityProduct,
        headline: `Fokuskan Skala pada ${priorityProduct}`,
        reason: patterns.winningProduct?.reason || "Produk dengan performa tertinggi",
        actionCTA: `Generate Next 5 Contents untuk ${priorityProduct}`,
      },
      nextContent,
    };
  }

  async generateRecommendations(data: PerformanceData[]): Promise<RecommendationResult> {
    const sorted = [...data].sort((a, b) => b.orders - a.orders);
    const best = sorted[0];
    return {
      winningPatterns: best
        ? [{ product: best.productName, hook: best.hook, angle: best.angle, duration: "10 detik", result: `Orders: ${best.orders}`, improvement: "Terbaik" }]
        : [],
      recommendedContent: [
        { title: "Variasi Winner", description: "Konsep teruji", product: best?.productName || "", angle: best?.angle || "", hook: best?.hook || "", reason: "Data-driven" },
      ],
      summary: "Evaluasi performa live AI",
    };
  }
}
