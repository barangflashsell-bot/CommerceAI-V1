import type {
  ProductScoutInput,
  ScoutScoreBreakdown,
  ScoutCategory,
  ProductScoutResult,
} from "../types";
import { generateTestingPlan } from "./testing-plan";

/**
 * Deterministic calculation of 7 scouting score dimensions:
 * 1. Demand Potential (0-100)
 * 2. Content Potential (0-100)
 * 3. Purchase Intent (0-100)
 * 4. Commission Attractiveness (0-100)
 * 5. Competition Risk (0-100, higher = healthier/lower saturation)
 * 6. Problem Strength (0-100)
 * 7. Demonstration Strength (0-100)
 */
export function calculateScoutDimensions(input: ProductScoutInput): ScoutScoreBreakdown {
  const text = `${input.name} ${input.category} ${input.description} ${input.targetBuyer}`.toLowerCase();

  // 1. Demand Potential (Category & utility baseline)
  let demandPotential = 60;
  if (/beauty|skincare|fashion|dapur|kitchen|gadget|elektronik|kesehatan|health|rumah tangga/.test(text)) {
    demandPotential += 20;
  }
  if (/viral|trending|solusi|populer|kebutuhan|harian|laris/.test(text)) {
    demandPotential += 10;
  }
  if (input.price > 0 && input.price <= 250000) {
    demandPotential += 8; // High affordability = broad demand
  }
  demandPotential = Math.min(95, Math.max(25, demandPotential));

  // 2. Content Potential (Visual virality, hookability, entertainment factor)
  let contentPotential = 55;
  if (/unboxing|sebelum|sesudah|review|transformasi|demonstrasi|ajaib|mini|portable|estetik|rapi/.test(text)) {
    contentPotential += 25;
  }
  if (/fashion|gadget|beauty|kitchen|home/.test(text)) {
    contentPotential += 15;
  }
  contentPotential = Math.min(95, Math.max(30, contentPotential));

  // 3. Purchase Intent (Impulse buy vs high consideration barrier)
  let purchaseIntent = 50;
  if (input.price > 0 && input.price <= 150000) {
    purchaseIntent += 35; // Easy impulse buy on TikTok/Shopee
  } else if (input.price <= 350000) {
    purchaseIntent += 20;
  } else if (input.price > 1000000) {
    purchaseIntent -= 15; // High friction consideration
  }
  if (/diskon|promo|flash sale|gratis ongkir|murah|hemat/.test(text)) {
    purchaseIntent += 10;
  }
  purchaseIntent = Math.min(95, Math.max(20, purchaseIntent));

  // 4. Commission Attractiveness (Affiliate % and absolute commission)
  let commissionAttractiveness = 40;
  if (input.commissionRate >= 20) {
    commissionAttractiveness = 95;
  } else if (input.commissionRate >= 15) {
    commissionAttractiveness = 85;
  } else if (input.commissionRate >= 10) {
    commissionAttractiveness = 75;
  } else if (input.commissionRate >= 7) {
    commissionAttractiveness = 65;
  } else if (input.commissionRate >= 5) {
    commissionAttractiveness = 55;
  } else {
    commissionAttractiveness = 35;
  }
  const estimatedCommissionPerSale = input.price * (input.commissionRate / 100);
  if (estimatedCommissionPerSale >= 30000) {
    commissionAttractiveness = Math.min(98, commissionAttractiveness + 10);
  }

  // 5. Competition Risk (Higher = healthier/less saturated market)
  let competitionRisk = 65;
  if (/unik|inovasi|jarang|pertama|terbaru|paten|spesifik|niche/.test(text)) {
    competitionRisk += 20; // Healthy differentiator
  }
  if (/kaos polos|case hp murah|sepatu kanvas|masker standar/.test(text)) {
    competitionRisk -= 25; // Super saturated commoditized space
  }
  competitionRisk = Math.min(92, Math.max(25, competitionRisk));

  // 6. Problem Strength (How urgent or irritating is the problem being solved?)
  let problemStrength = 55;
  if (/rusak|kotor|sakit|pegal|bocor|berantakan|jerawat|kusam|ribet|lama|susah|repot|sulit/.test(text)) {
    problemStrength += 30;
  } else if (/mengatasi|solusi|menghilangkan|merapikan|mempermudah|cepat/.test(text)) {
    problemStrength += 18;
  }
  problemStrength = Math.min(95, Math.max(30, problemStrength));

  // 7. Demonstration Strength (Sensory appeal, instant visual proof)
  let demonstrationStrength = 50;
  if (/bersih|kinclong|tajam|otomatis|langsung|terang|sedot|lap|potong|nyala|cepat|hasil/.test(text)) {
    demonstrationStrength += 35;
  }
  if (/gadget|alat|kitchen|beauty|cleaning|otomotif/.test(text)) {
    demonstrationStrength += 12;
  }
  demonstrationStrength = Math.min(96, Math.max(25, demonstrationStrength));

  return {
    demandPotential,
    contentPotential,
    purchaseIntent,
    commissionAttractiveness,
    competitionRisk,
    problemStrength,
    demonstrationStrength,
  };
}

/**
 * Calculates overall weighted score from 7 dimensions:
 * Weights:
 * - Demand: 15%
 * - Content: 15%
 * - Intent: 15%
 * - Commission: 15%
 * - Competition: 10%
 * - Problem: 15%
 * - Demonstration: 15%
 */
export function calculateWeightedScoutScore(breakdown: ScoutScoreBreakdown): number {
  const rawScore =
    0.15 * breakdown.demandPotential +
    0.15 * breakdown.contentPotential +
    0.15 * breakdown.purchaseIntent +
    0.15 * breakdown.commissionAttractiveness +
    0.10 * breakdown.competitionRisk +
    0.15 * breakdown.problemStrength +
    0.15 * breakdown.demonstrationStrength;

  return Math.round(rawScore * 10) / 10;
}

export function determineScoutCategory(score: number): ScoutCategory {
  if (score >= 80) return "HIGH OPPORTUNITY";
  if (score >= 65) return "TEST";
  if (score >= 50) return "LOW SIGNAL";
  return "AVOID";
}

/**
 * Main Product Scouting Evaluator
 */
export function evaluateProductScout(input: ProductScoutInput): ProductScoutResult {
  const breakdown = calculateScoutDimensions(input);
  const score = calculateWeightedScoutScore(breakdown);
  const category = determineScoutCategory(score);

  // Derive contextual reasons, risks, and angles
  const whyParts: string[] = [];
  if (breakdown.demonstrationStrength >= 75) {
    whyParts.push("Kekuatan demonstrasi visual sangat tinggi untuk video hook 3 detik.");
  }
  if (breakdown.purchaseIntent >= 75) {
    whyParts.push("Harga terjangkau dengan hambatan keputusan beli (impulse purchase) yang sangat rendah.");
  }
  if (breakdown.commissionAttractiveness >= 75) {
    whyParts.push(`Struktur komisi ${input.commissionRate}% memberikan yield affiliate yang menarik per transaksi.`);
  }
  if (whyParts.length === 0) {
    whyParts.push("Produk memiliki basis fungsi yang jelas untuk audiens affiliate e-commerce.");
  }

  const risks: string[] = [];
  if (breakdown.competitionRisk < 60) {
    risks.push("Kategori produk memiliki tingkat kompetisi dan saturasi video affiliate yang cukup padat.");
  }
  if (breakdown.purchaseIntent < 55) {
    risks.push("Harga relatif tinggi memerlukan edukasi nilai (value proposition) lebih mendalam agar penonton check out.");
  }
  if (breakdown.contentPotential < 60) {
    risks.push("Format visual produk cenderung statis; kreator membutuhkan rekayasa situasi problem-solving yang dramatis.");
  }
  if (risks.length === 0) {
    risks.push("Risiko minim, fokus utama adalah eksekusi variasi angle dan konsistensi posting.");
  }

  const bestAngles = [
    `Transformasi Instan: Tunjukkan kondisi sebelum vs sesudah memakai ${input.name} dalam 5 detik pertama.`,
    `Relateable Frustration: Mulai dari keluhan nyata yang dialami ${input.targetBuyer} sehari-hari.`,
    `Price-to-Value No-Brainer: Bandingkan biaya repot/alat mahal dengan efisiensi ${input.name}.`,
  ];

  const testingPlan = generateTestingPlan({
    name: input.name,
    category: input.category,
    price: input.price,
    commissionRate: input.commissionRate,
    targetBuyer: input.targetBuyer,
    problemSolved: input.description,
  });

  const expectedGoal =
    category === "HIGH OPPORTUNITY"
      ? `Validasi 10 video awal dalam 7 hari dengan target mencapai minimum 30+ order dan scale up volume harian.`
      : category === "TEST"
      ? `Eksperimen 10 video dengan 3 angle berbeda untuk mendeteksi winning hook dan ambang konversi minimum 2%.`
      : `Uji terbatas (3-5 konten) untuk memverifikasi apakah ada sudut pandang tak terduga sebelum komitmen penuh.`;

  return {
    score,
    category,
    breakdown,
    status: "DISCOVERED",
    why: whyParts.join(" "),
    risks,
    bestAngles,
    testingPlan,
    expectedGoal,
    dataSource: "AI ESTIMATE",
  };
}
