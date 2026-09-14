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
  ConceptItem,
  AggregatedPerformanceData,
  WinningPatternResult,
  DataSufficiencyResult,
  AIInsightResult,
  NextContentResult,
} from "./types";
import { generateNextContentRecommendations } from "./engine/next-content";
import { logAIRequest } from "./logger";

export class MockAIProvider implements AIProvider {
  name = "MockAIProvider";
  isMock = true;

  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async analyzeProduct(input: ProductAnalysisInput): Promise<ProductAnalysisResult> {
    const start = Date.now();
    await this.delay(600);

    const priceScore = input.price < 100000 ? 75 : input.price < 500000 ? 65 : 50;
    const commissionScore = Math.min(95, input.commissionRate * 5 + 40);
    const descLength = input.description.length + input.advantages.length;
    const contentScore = Math.min(90, 50 + descLength / 10);
    const problemScore = input.problemSolved.length > 30 ? 78 : 55;
    const intentScore = Math.min(85, 45 + input.targetAudience.length / 5);
    const categoryCompetitionMap: Record<string, number> = {
      Fashion: 70,
      Beauty: 75,
      Elektronik: 65,
      "Home & Living": 50,
      Kesehatan: 60,
      "Makanan & Minuman": 55,
      Otomotif: 45,
      Olahraga: 40,
      "Ibu & Bayi": 50,
    };
    const competitionRisk = categoryCompetitionMap[input.category] || 55;

    const overall = Math.round(
      priceScore * 0.15 +
        commissionScore * 0.2 +
        contentScore * 0.2 +
        problemScore * 0.2 +
        intentScore * 0.15 +
        competitionRisk * 0.1
    );

    const result: ProductAnalysisResult = {
      opportunityScore: overall,
      breakdown: {
        demandPotential: priceScore,
        contentPotential: contentScore,
        problemSolutionStrength: problemScore,
        purchaseIntent: intentScore,
        commissionAttractiveness: commissionScore,
        competitionRisk,
      },
      reasoning:
        `[AI Estimated Score] Produk "${input.name}" memiliki skor peluang ${overall}/100. ` +
        `Produk dalam kategori ${input.category} dengan harga ${new Intl.NumberFormat("id-ID").format(input.price)} ` +
        `memiliki potensi demand yang ${priceScore > 65 ? "baik" : "cukup"} di pasar affiliate. ` +
        `Komisi ${input.commissionRate}% memberikan insentif yang ${commissionScore > 70 ? "menarik" : "standar"} untuk promosi.`,
      targetAudience: [
        input.targetAudience,
        `Pengguna yang mencari solusi untuk ${input.problemSolved.substring(0, 50)}`,
        `Pembeli online yang tertarik dengan kategori ${input.category}`,
        "Pengguna media sosial yang aktif mencari rekomendasi produk",
      ],
      painPoints: [
        input.problemSolved,
        `Kesulitan menemukan ${input.category} yang berkualitas dengan harga terjangkau`,
        "Produk sejenis sering tidak sesuai ekspektasi",
        "Kurangnya informasi detail sebelum membeli",
      ],
      buyingTriggers: [
        "Harga promo terbatas",
        "Review positif dari pengguna lain",
        "Demonstrasi penggunaan yang meyakinkan",
        "Perbandingan dengan alternatif yang lebih mahal",
        "Social proof dari konten kreator",
      ],
      sellingProposition:
        `${input.name} adalah solusi ${input.category} yang mengatasi ${input.problemSolved.substring(0, 80)}. ` +
        `Dengan keunggulan ${input.advantages.substring(0, 100)}, produk ini menawarkan nilai terbaik di kelasnya.`,
      contentAngles: [
        {
          name: "Problem → Solution",
          description: `Tunjukkan masalah ${input.problemSolved.substring(0, 40)} lalu solusinya`,
          score: 88,
          reason: "Angle paling efektif untuk produk yang memecahkan masalah nyata",
        },
        {
          name: "Before → After",
          description: "Transformasi visual sebelum dan sesudah penggunaan",
          score: 82,
          reason: "Visual yang kuat meningkatkan engagement",
        },
        {
          name: "Demonstration",
          description: "Demo langsung cara penggunaan produk",
          score: 79,
          reason: "Menunjukkan fungsi nyata membangun kepercayaan",
        },
        {
          name: "Comparison",
          description: "Bandingkan dengan produk sejenis atau cara lama",
          score: 75,
          reason: "Membantu audiens melihat nilai lebih produk",
        },
        {
          name: "Social Proof",
          description: "Testimoni dan reaksi pengguna lain",
          score: 71,
          reason: "Membangun kredibilitas dan FOMO",
        },
      ],
      whyPromote:
        `Komisi ${input.commissionRate}% dengan harga jual Rp${new Intl.NumberFormat("id-ID").format(input.price)} ` +
        `menghasilkan estimasi komisi Rp${new Intl.NumberFormat("id-ID").format((input.price * input.commissionRate) / 100)} per penjualan. ` +
        `Produk ini memiliki nilai visual yang baik untuk konten video pendek.`,
    };

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "analyzeProduct",
      success: true,
      latencyMs: Date.now() - start,
    });

    return result;
  }

  async generateHooks(input: { productName: string; problemSolved: string; targetAudience: string }): Promise<HookItem[]> {
    return [
      { id: 1, text: `Stop! Jangan beli ${input.productName} sebelum nonton ini...`, type: "Curiosity Gap", strength: "Tinggi" },
      { id: 2, text: `Aku nyesel baru tau ${input.productName} sekarang 😭`, type: "Emotional Regret", strength: "Tinggi" },
      { id: 3, text: `${input.productName} ini bikin masalah ${input.problemSolved.substring(0, 30)} kelar!`, type: "Problem-Solution", strength: "Tinggi" },
      { id: 4, text: `Trik rahasia buat kamu yang sering ngalamin ini...`, type: "Intrigue", strength: "Sedang" },
      { id: 5, text: `Kalau kamu masih pakai cara lama, kasian banget...`, type: "FOMO", strength: "Tinggi" },
    ];
  }

  async generateAngles(input: { productName: string; description: string; problemSolved: string }): Promise<AngleItem[]> {
    return [
      { id: 1, name: "Problem → Solution", description: `Bahas tuntas masalah ${input.problemSolved.substring(0, 30)} dan solusi instannya`, targetEmotion: "Lega & Solutif", score: 92 },
      { id: 2, name: "Curiosity Gap", description: "Buka rasa penasaran dengan fakta mengejutkan", targetEmotion: "Penasaran", score: 87 },
      { id: 3, name: "Direct Demonstration", description: "Unboxing dan demo fungsi dalam 5 detik pertama", targetEmotion: "Terpukau", score: 84 },
      { id: 4, name: "Social Proof", description: "Review antusias dan testimoni pengguna", targetEmotion: "Percaya", score: 80 },
    ];
  }

  async generateContentStrategy(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    const start = Date.now();
    await this.delay(700);

    const hooks: HookItem[] = [
      { id: 1, text: `Stop! Jangan beli ${input.productName} sebelum nonton ini...`, type: "Curiosity Gap", strength: "Tinggi" },
      { id: 2, text: `Aku nyesel baru tau ${input.productName} sekarang 😭`, type: "Emotional Regret", strength: "Tinggi" },
      { id: 3, text: `${input.productName} ini bikin hidupku berubah drastis...`, type: "Transformation", strength: "Tinggi" },
      { id: 4, text: `Kalau kamu masih pakai cara lama, kasian banget...`, type: "Pain Point", strength: "Sedang" },
      { id: 5, text: `Produk Rp149.000 ini mengalahkan yang jutaan!`, type: "Value Comparison", strength: "Tinggi" },
    ];

    const angles: AngleItem[] = [
      { id: 1, name: "Problem → Solution", description: `Fokus pada masalah ${input.problemSolved.substring(0, 30)} dan bagaimana produk menyelesaikannya`, targetEmotion: "Lega, Tertolong", score: 92 },
      { id: 2, name: "Curiosity / Intrigue", description: "Buka dengan misteri atau fakta mengejutkan yang memancing penonton bertahan", targetEmotion: "Penasaran, Tertarik", score: 87 },
      { id: 3, name: "Social Proof / FOMO", description: "Tunjukkan bahwa banyak orang sudah menggunakan dan merasakan manfaatnya", targetEmotion: "Takut Ketinggalan, Percaya", score: 84 },
      { id: 4, name: "Direct Demo", description: "Tunjukkan produk beraksi langsung tanpa basa-basi", targetEmotion: "Kagum, Yakin", score: 80 },
    ];

    const concepts: ConceptItem[] = [
      {
        id: 1,
        title: "The Problem Solver",
        description: `Tunjukkan frustrasi karena ${input.problemSolved.substring(0, 40)}, lalu perkenalkan ${input.productName} sebagai solusi instan.`,
        hook: hooks[0].text,
        angle: "Problem → Solution",
        flow: "Frustrasi (0-2s) → Solusi Muncul (2-5s) → Demo Manfaat (5-8s) → CTA (8-10s)",
        expectedImpact: "Tinggi untuk audiens yang sedang mengalami masalah serupa",
      },
      {
        id: 2,
        title: "The Secret Weapon",
        description: `Buka dengan 'rahasia' yang jarang orang tahu tentang ${input.productName}.`,
        hook: hooks[1].text,
        angle: "Curiosity",
        flow: "Hook Rahasia (0-2s) → Reveal Produk (2-4s) → Bukti Keunggulan (4-7s) → Link di Bio (7-10s)",
        expectedImpact: "CTR tinggi karena rasa penasaran",
      },
      {
        id: 3,
        title: "Before vs After Fast Cut",
        description: "Transisi cepat antara kondisi sebelum dan sesudah menggunakan produk.",
        hook: hooks[2].text,
        angle: "Transformation",
        flow: "Before Berantakan (0-2s) → Transisi Keren (2-3s) → After Sempurna (3-7s) → Cara Dapatkan (7-10s)",
        expectedImpact: "Engagement tinggi karena visual transformation yang memuaskan",
      },
      {
        id: 4,
        title: "Stop Doing This",
        description: "Edukasi penonton tentang kesalahan umum yang mereka lakukan, lalu berikan solusi yang benar.",
        hook: hooks[3].text,
        angle: "Pain Point / Education",
        flow: "Tegur Kesalahan (0-2s) → Kenapa Salah (2-4s) → Cara Benar Pakai Produk (4-7s) → Diskon Terbatas (7-10s)",
        expectedImpact: "Membangun otoritas dan kepercayaan",
      },
      {
        id: 5,
        title: "Is It Worth It?",
        description: "Review jujur dengan nada skeptis yang berubah menjadi takjub.",
        hook: hooks[4].text,
        angle: "Review / Social Proof",
        flow: "Awal Ragu (0-2s) → Tes Produk (2-5s) → Hasil Mengejutkan (5-8s) → Kesimpulan Worth It (8-10s)",
        expectedImpact: "Konversi tinggi karena terasa autentik",
      },
    ];

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "generateContentStrategy",
      success: true,
      latencyMs: Date.now() - start,
    });

    return {
      hooks,
      angles,
      concepts,
      bestConcept: { index: 0, reason: "Memiliki alignment tertinggi antara pain point produk dan intent beli audiens affiliate" },
    };
  }

  async generateContent(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    return this.generateContentStrategy(input);
  }

  async generateStoryboard(input: StoryboardInput): Promise<StoryboardResult> {
    const start = Date.now();
    await this.delay(500);

    const durationSec = parseInt(input.duration) || 10;
    const scenes = [
      {
        sceneNumber: 1,
        timeRange: "0-2 detik",
        visual: `Close-up ekspresi frustrasi / masalah terkait ${input.productDescription.substring(0, 30)}. Teks hook tebal di layar.`,
        camera: "Close-up, sedikit goyang (handheld feel)",
        action: "Karakter menunjukkan masalah dengan gestur ekspresif",
        purpose: "STOP THE SCROLL — tangkap perhatian dalam 2 detik pertama",
      },
      {
        sceneNumber: 2,
        timeRange: "2-5 detik",
        visual: `Transisi dinamis memperlihatkan ${input.productName}. Produk tampak bersih, jelas, dan menarik.`,
        camera: "Medium shot, transisi zoom-in cepat",
        action: "Produk diperkenalkan, mulai digunakan",
        purpose: "REVEAL SOLUTION — tunjukkan produk sebagai jawaban dari masalah",
      },
      {
        sceneNumber: 3,
        timeRange: "5-8 detik",
        visual: "Demonstrasi fitur utama produk beraksi. Teks poin keunggulan muncul berurutan.",
        camera: "Over-the-shoulder atau point-of-view (POV)",
        action: "Penggunaan produk secara nyata dan hasil instan",
        purpose: "BUILD DESIRE — tunjukkan betapa mudahnya masalah terselesaikan",
      },
      {
        sceneNumber: 4,
        timeRange: `8-${durationSec} detik`,
        visual: "Produk di samping hasil akhir. Panah mengarah ke tombol keranjang / bio. Teks harga promo.",
        camera: "Medium close-up dengan produk tetap terlihat jelas",
        action: "Gestur menunjuk ke arah link/keranjang kuning",
        purpose: "CALL TO ACTION — dorong aksi klik dan pembelian sekarang",
      },
    ];

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "generateStoryboard",
      success: true,
      latencyMs: Date.now() - start,
    });

    return {
      scenes,
      productConsistencyRules: [
        "Preserve exact product shape",
        "Preserve exact color",
        "Preserve exact material",
        "Preserve exact logo",
        "Preserve exact proportions",
        "Do not redesign",
        "Do not replace product",
        "Do not add unrelated product features",
      ],
      totalDuration: `${durationSec} detik`,
    };
  }

  async generateVideoPrompt(storyboard: StoryboardResult, input: StoryboardInput): Promise<VideoPromptResult> {
    const start = Date.now();
    await this.delay(400);

    const result: VideoPromptResult = {
      duration: `${parseInt(input.duration) || 10} seconds`,
      aspect_ratio: "9:16",
      style: input.style,
      product_consistency: {
        reference_image: true,
        preserve_exact_product: true,
        do_not_redesign: true,
      },
      scenes: storyboard.scenes.map((scene) => ({
        time: scene.timeRange.replace(" detik", "s"),
        visual: scene.visual,
        camera: scene.camera,
        action: scene.action,
        lighting:
          scene.sceneNumber === 1
            ? "Natural, slightly moody"
            : scene.sceneNumber === storyboard.scenes.length
            ? "Bright, clean, professional"
            : "Well-lit, product-focused",
      })),
      negative_prompt: [
        "product redesign",
        "different product",
        "distorted product",
        "extra logo",
        "wrong proportions",
        "text overlay unless specified",
        "watermark",
        "blurry product",
        "wrong colors",
      ],
    };

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "generateVideoPrompt",
      success: true,
      latencyMs: Date.now() - start,
    });

    return result;
  }

  async analyzePerformance(data: PerformanceData[]): Promise<PerformanceAnalysisResult> {
    const start = Date.now();
    await this.delay(500);

    if (data.length === 0) {
      return {
        bestProduct: null,
        bestHook: null,
        bestAngle: null,
        bestVideoType: null,
        bestPlatform: null,
        highestCTR: null,
        highestCVR: null,
        highestOrder: null,
        highViewsLowConversion: [],
        lowViewsHighConversion: [],
        whatWorked: ["Belum ada data performa untuk dianalisis."],
        whatFailed: [],
        why: ["Tambahkan data performa konten untuk mendapatkan analisis AI."],
        nextActions: ["Input data performa dari konten yang sudah dipublish."],
      };
    }

    const sortedByOrders = [...data].sort((a, b) => b.orders - a.orders);
    const bestByOrder = sortedByOrders[0];
    const sortedByCTR = [...data].sort((a, b) => b.ctr - a.ctr);
    const sortedByCVR = [...data].sort((a, b) => b.cvr - a.cvr);

    const avgCTR = data.reduce((sum, d) => sum + d.ctr, 0) / data.length;
    const avgCVR = data.reduce((sum, d) => sum + d.cvr, 0) / data.length;

    const highViewsLow = data.filter((d) => d.views > 1000 && d.cvr < avgCVR * 0.5);
    const lowViewsHigh = data.filter((d) => d.views < 500 && d.cvr > avgCVR * 1.5);

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "analyzePerformance",
      success: true,
      latencyMs: Date.now() - start,
    });

    return {
      bestProduct: bestByOrder ? { name: bestByOrder.productName, reason: `${bestByOrder.orders} orders dengan CTR ${(bestByOrder.ctr * 100).toFixed(1)}%` } : null,
      bestHook: bestByOrder?.hook ? { text: bestByOrder.hook, reason: `Menghasilkan ${bestByOrder.orders} orders` } : null,
      bestAngle: bestByOrder?.angle ? { name: bestByOrder.angle, reason: `CTR ${(bestByOrder.ctr * 100).toFixed(1)}% di atas rata-rata` } : null,
      bestVideoType: bestByOrder?.videoConcept ? { type: bestByOrder.videoConcept, reason: "Performa terbaik berdasarkan total orders" } : null,
      bestPlatform: bestByOrder ? { name: bestByOrder.platform, reason: "Platform dengan konversi tertinggi" } : null,
      highestCTR: sortedByCTR[0] ? { content: sortedByCTR[0].contentId, value: sortedByCTR[0].ctr } : null,
      highestCVR: sortedByCVR[0] ? { content: sortedByCVR[0].contentId, value: sortedByCVR[0].cvr } : null,
      highestOrder: bestByOrder ? { content: bestByOrder.contentId, value: bestByOrder.orders } : null,
      highViewsLowConversion: highViewsLow.map((d) => ({ content: d.contentId, views: d.views, cvr: d.cvr })),
      lowViewsHighConversion: lowViewsHigh.map((d) => ({ content: d.contentId, views: d.views, cvr: d.cvr })),
      whatWorked: [
        bestByOrder ? `Konten "${bestByOrder.contentId}" dengan angle ${bestByOrder.angle || "N/A"} menghasilkan ${bestByOrder.orders} orders.` : "",
        sortedByCTR[0] ? `CTR tertinggi ${(sortedByCTR[0].ctr * 100).toFixed(1)}% dicapai oleh konten "${sortedByCTR[0].contentId}".` : "",
        `Rata-rata CTR akun: ${(avgCTR * 100).toFixed(1)}%`,
      ].filter(Boolean),
      whatFailed:
        highViewsLow.length > 0
          ? highViewsLow.map((d) => `"${d.contentId}" mendapat ${d.views} views tapi hanya ${(d.cvr * 100).toFixed(1)}% CVR — masalah di buying intent atau CTA.`)
          : ["Belum terdeteksi pola kegagalan yang signifikan."],
      why: [
        "Konten dengan angle problem-solution cenderung memiliki CTR lebih tinggi karena langsung menyentuh pain point.",
        "Video pendek (10 detik) dengan hook kuat di 2 detik pertama menghasilkan retention rate lebih baik.",
        highViewsLow.length > 0
          ? "Views tinggi tapi konversi rendah biasanya disebabkan hook yang kuat tapi CTA lemah atau produk kurang relevan dengan audience."
          : "",
      ].filter(Boolean),
      nextActions: [
        bestByOrder ? `Buat 5 variasi konten baru untuk "${bestByOrder.productName}" dengan angle yang sama.` : "Publish konten pertama dan input datanya.",
        "Fokus pada hook yang menciptakan curiosity gap — tipe hook ini terbukti paling efektif.",
        highViewsLow.length > 0 ? "Perbaiki CTA pada konten dengan views tinggi tapi konversi rendah." : "",
        "Test platform berbeda untuk menemukan audience yang paling responsif.",
      ].filter(Boolean),
    };
  }

  async generateNextContent(
    winningPatterns: WinningPatternResult,
    aggregated: AggregatedPerformanceData
  ): Promise<NextContentResult> {
    const start = Date.now();
    await this.delay(300);
    const result = generateNextContentRecommendations(winningPatterns, aggregated);

    await logAIRequest({
      provider: this.name,
      model: "mock-v1",
      operation: "generateNextContent",
      success: true,
      latencyMs: Date.now() - start,
    });

    return result;
  }

  async generateInsights(
    aggregated: AggregatedPerformanceData,
    patterns: WinningPatternResult,
    sufficiency: DataSufficiencyResult
  ): Promise<AIInsightResult> {
    const nextContent = await this.generateNextContent(patterns, aggregated);

    const priorityProduct = patterns.winningProduct?.name || "Katalog Terpilih";
    const recommendation = {
      priorityProduct,
      headline: `Prioritaskan Produk "${priorityProduct}"`,
      reason: patterns.winningProduct
        ? `Menghasilkan ${patterns.winningProduct.reason}. Memiliki efisiensi konversi tertinggi per view.`
        : "Produk dengan skor potensi tertinggi siap dipromosikan.",
      actionCTA: `Generate Next 5 Contents untuk ${priorityProduct}`,
    };

    return {
      sufficiency,
      wins: patterns,
      whatWorked: [
        patterns.winningAngle ? `Angle "${patterns.winningAngle.name}" menghasilkan CVR tertinggi di akun.` : "Angle problem-solution memimpin.",
        patterns.winningHook ? `Hook "${patterns.winningHook.text}" memicu stop rate tertinggi.` : "Hook curiosity efektif.",
        `Rata-rata CTR akun ${(aggregated.account.avgCTR * 100).toFixed(1)}% dengan total ${aggregated.account.totalOrders} orders.`,
      ],
      whatFailed:
        patterns.losses.length > 0
          ? patterns.losses.map((l) => l.reason)
          : ["Tidak ada kebocoran konversi signifikan pada data saat ini."],
      why: [
        "Audiens media sosial membutuhkan demonstrasi visual fungsi nyata sebelum checkout.",
        "Video 10 detik mempertahankan watch time optimal algoritma TikTok dan Shopee Video.",
      ],
      opportunities: patterns.opportunities,
      nextActions: [
        `Produksi 5 konsep turunan untuk ${priorityProduct}.`,
        "Perbaiki CTA pada video bertrafik tinggi.",
        "Uji cross-posting ke platform pemenang.",
      ],
      recommendation,
      nextContent,
    };
  }

  async generateRecommendations(data: PerformanceData[]): Promise<RecommendationResult> {
    const sorted = [...data].sort((a, b) => b.orders - a.orders);
    const best = sorted[0];
    const avgCTR = data.length > 0 ? data.reduce((s, d) => s + d.ctr, 0) / data.length : 0;

    return {
      winningPatterns: best
        ? [
            {
              product: best.productName,
              hook: best.hook || "Hook tidak tercatat",
              angle: best.angle || "Angle tidak tercatat",
              duration: "10 detik",
              result: `CTR ${(best.ctr * 100).toFixed(1)}%`,
              improvement: `+${avgCTR > 0 ? (((best.ctr - avgCTR) / avgCTR) * 100).toFixed(0) : 0}% vs rata-rata`,
            },
          ]
        : [],
      recommendedContent: [
        {
          title: "Variasi Problem-Solution",
          description: "Buat variasi baru dari konsep yang sudah terbukti berhasil",
          product: best?.productName || "Pilih produk dengan score tertinggi",
          angle: "Problem → Solution",
          hook: "Hook curiosity gap baru",
          reason: "Angle ini secara konsisten menghasilkan CTR tertinggi",
        },
      ],
      summary: "Rekomendasi performa affiliate dihitung dari metrik riil.",
    };
  }
}
