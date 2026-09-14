import type { DataSufficiencyResult, SufficiencyTier } from "../types";

export function evaluateDataSufficiency(recordCount: number): DataSufficiencyResult {
  if (recordCount < 5) {
    return {
      recordCount,
      tier: "insufficient",
      confidenceLabel: "Data Belum Cukup",
      message: `Tersedia ${recordCount} record performa. Data belum cukup untuk menemukan winning pattern secara akurat (minimal butuh 5 record data konten).`,
    };
  }

  if (recordCount < 20) {
    return {
      recordCount,
      tier: "early",
      confidenceLabel: "Early Signal",
      message: `Tersedia ${recordCount} record performa. Pola kemenangan awal mulai terdeteksi, namun disarankan menambah data hingga 20+ untuk validasi stabil.`,
    };
  }

  if (recordCount < 50) {
    return {
      recordCount,
      tier: "meaningful",
      confidenceLabel: "Meaningful Pattern",
      message: `Tersedia ${recordCount} record performa. Pola konversi memiliki tingkat signifikansi statistik yang tinggi dan layak dijadikan acuan scaling.`,
    };
  }

  return {
    recordCount,
    tier: "strong",
    confidenceLabel: "Strong Pattern",
    message: `Tersedia ${recordCount} record performa. Pola performa sangat kuat dan mapan untuk automated decision-making.`,
  };
}
