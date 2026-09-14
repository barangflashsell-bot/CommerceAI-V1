import type {
  WinningPatternResult,
  AggregatedPerformanceData,
  NextContentResult,
  NextContentConcept
} from "../types";

export function generateNextContentRecommendations(
  patterns: WinningPatternResult,
  aggregated: AggregatedPerformanceData
): NextContentResult {
  const prodName = patterns.winningProduct?.name || "Produk Pilihan Utama";
  const angleName = patterns.winningAngle?.name || "Problem-Solution";
  const hookText = patterns.winningHook?.text || "Solusi praktis yang kamu cari";
  const platform = patterns.winningPlatform?.name || "TikTok";
  const bestType = patterns.winningContentType?.type || "Demonstrasi Produk";
  const hasLosses = patterns.losses.length > 0;

  const concepts: NextContentConcept[] = [
    {
      title: `1. Scale Winner: Variasi Deep-Dive ${angleName}`,
      reason: `Memperdalam angle "${angleName}" yang mencatatkan performa konversi terbaik pada produk ${prodName}.`,
      hook: `Nggak nyangka trik ini bikin masalah dapur kelar dalam 10 detik!`,
      angle: angleName,
      concept: `Tampilkan adegan frustrasi 2 detik awal, dilanjutkan aksi penggunaan ${bestType} secara close-up dan penekanan solusi instan.`,
      expectedGoal: "Meningkatkan volume order langsung dari audiens dengan problem serupa",
      basedOnPattern: `Berdasarkan data historis: Angle "${angleName}" menyumbang kontribusi order tertinggi dengan performance score ${patterns.winningProduct?.score || 85}/100.`,
    },
    {
      title: `2. Hook Iteration: Curiosity Gap Overhaul`,
      reason: `Menguji hook variasi rasa penasaran baru untuk meningkatkan CTR di atas rata-rata akun (${(aggregated.account.avgCTR * 100).toFixed(1)}%).`,
      hook: `Kenapa barang Rp80 ribuan ini bisa bikin orang beli berkali-kali?`,
      angle: "Curiosity / Value Comparison",
      concept: `Bandingkan hasil penggunaan produk dengan barang mahal yang tidak efisien, perlihatkan perbandingan visual split screen.`,
      expectedGoal: "Menaikkan CTR awal dan retensi penonton 3 detik pertama",
      basedOnPattern: `Berdasarkan data historis: Hook terpilih "${hookText.substring(0, 45)}..." membuktikan formula perbandingan menghasilkan conversion rate tinggi.`,
    },
    {
      title: `3. Loss Fixer: High Traffic High Conversion Remake`,
      reason: hasLosses
        ? `Memperbaiki drop konversi pada konten traffic tinggi yang sebelumnya memiliki CVR rendah.`
        : `Mencegah kebocoran konversi dengan mempertegas elemen CTA di detik 7-10.`,
      hook: `Stop scroll! Kalau kamu butuh ini, beli sekarang sebelum promonya habis.`,
      angle: "Direct Scarcity & Social Proof",
      concept: `Visual cepat menunjukkan 3 fungsi utama sekaligus dengan badge promo dan teks panah jelas mengarah ke keranjang kuning/link affiliate.`,
      expectedGoal: "Memperbaiki rasio CVR dari penonton pasif menjadi pembeli aktif",
      basedOnPattern: hasLosses
        ? `Berdasarkan data historis: Konten "${patterns.losses[0].content}" tembus ${patterns.losses[0].views.toLocaleString("id-ID")} views tapi CVR rendah — video ini dirancang khusus untuk memanen konversi. `
        : `Berdasarkan data historis: Akun rata-rata memiliki CVR ${(aggregated.account.avgCVR * 100).toFixed(1)}%, diperlukan CTA agresif untuk meningkatkan margin.`,
    },
    {
      title: `4. Social Proof & Micro-Story`,
      reason: `Memanfaatkan bukti sosial untuk audiens ${platform} yang membutuhkan keyakinan ulasan sebelum checkout.`,
      hook: `Udah 500+ orang checkout rak ini minggu ini, emang sebagus itu?`,
      angle: "Social Proof / User Testimonial",
      concept: `Membacakan 2 ulasan bintang 5 pengguna asli sambil menguji kebenaran ulasan tersebut secara visual live.`,
      expectedGoal: "Menghilangkan keraguan pembeli (buyer hesitation) dan menaikkan Add-to-Cart",
      basedOnPattern: `Berdasarkan data historis: Platform ${platform} merespons positif terhadap format review jujur dengan revenue Rp${new Intl.NumberFormat("id-ID").format(aggregated.account.totalRevenue)}.`,
    },
    {
      title: `5. Speed Demo: Extreme 10-Second Showcase`,
      reason: `Format video ultra-singkat 10 detik sesuai Winning Duration untuk menaikkan completion rate algoritma.`,
      hook: `Lihat apa yang terjadi dalam 3.. 2.. 1!`,
      angle: "Direct Demonstration",
      concept: `Timelapse cepat 5 detik perakitan/penggunaan tanpa kata-kata rumit, diakhiri penampakan hasil sempurna dan voiceover CTA.`,
      expectedGoal: "Mendorong algoritma memutar ulang video (re-watch rate) dan menaikkan organic reach",
      basedOnPattern: `Berdasarkan data historis: Durasi 10 detik konsisten mencatatkan retention tertinggi dan paling minim bounce rate di awal video.`,
    },
  ];

  const strategySummary = `Keputusan Konten: Fokuskan 70% kapasitas produksi pada produk "${prodName}" menggunakan platform ${platform}. Terapkan 5 konsep di atas yang dirancang khusus dari kelemahan dan kekuatan data metrik historis.`;

  return {
    concepts,
    strategySummary,
  };
}
