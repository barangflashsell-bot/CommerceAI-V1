import type { TestingPlanConfig, TestingPlanSuccessCriteria } from "../types";

export interface TestingPlanInput {
  name: string;
  category: string;
  price: number;
  commissionRate: number;
  targetBuyer: string;
  problemSolved?: string;
}

/**
 * Generates an initial testing plan for an affiliate product.
 * Success criteria is labeled "AI TESTING THRESHOLD" and can be customized by the user.
 */
export function generateTestingPlan(input: TestingPlanInput): TestingPlanConfig {
  const defaultCriteria: TestingPlanSuccessCriteria = {
    minimumCTR: 0.02, // 2.0%
    minimumCVR: 0.03, // 3.0%
    minimumRPM: 15000, // Rp 15.000 per 1000 views
  };

  const angles = [
    `Problem-Agitate-Solve: Angkat rasa frustrasi ${input.targetBuyer} lalu hadirkan ${input.name} sebagai penyelamat.`,
    `Before vs After: Demonstrasi kontras 5 detik pertama hasil pemakaian produk.`,
    `Social Proof & FOMO: "Kenapa barang ini lagi viral dan wajib punya sebelum kehabisan diskon?".`,
  ];

  const hooks = [
    `"Jujur nyesel baru tahu alat ini sekarang, hidup jadi 10x lebih gampang..."`,
    `"Stop buang uang buat cara lama yang ribet! Coba lihat ini..."`,
    `"Khusus buat kamu yang capek sama masalah ini, aku nemu solusinya!"`,
    `"Barang 50 ribuan yang fungsinya kayak barang jutaan..."`,
    `"Sebelum kamu beli yang mahal, tonton video ini sampai habis!"`,
  ];

  const platforms = ["TikTok", "Shopee Video", "Instagram Reels"];

  return {
    testDays: 7,
    videoCount: 10,
    angles,
    hooks,
    platforms,
    successCriteria: defaultCriteria,
    thresholdType: "AI TESTING THRESHOLD",
  };
}
