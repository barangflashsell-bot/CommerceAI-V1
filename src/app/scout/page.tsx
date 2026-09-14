"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Loader2,
  Layers,
  BarChart3,
  Target,
  ShieldAlert,
  Zap,
  Check,
  Gem,
  Sliders,
} from "lucide-react";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import { formatCurrency, getScoreColor, getScoreBgColor } from "@/lib/utils";
import type {
  ProductScoutResult,
  ProductPortfolioSummary,
  ProductScoutInput,
} from "@/lib/ai/types";

export default function ProductScoutPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<ProductPortfolioSummary | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  // Form State
  const [form, setForm] = useState<ProductScoutInput>({
    name: "",
    category: "Kitchen & Home",
    price: 89000,
    commissionRate: 15,
    description: "Alat pengupas buah dan pemotong sayur serbaguna dengan 6 mata pisau stainless steel anti karat. Menghemat waktu persiapan masak hingga 70%.",
    targetBuyer: "Ibu rumah tangga & anak kos yang sering masak cepat",
    productUrl: "https://shopee.co.id/product/kitchen-mandoline-slicer",
    imageUrl: "",
  });

  const [evaluating, setEvaluating] = useState(false);
  const [scoutResult, setScoutResult] = useState<ProductScoutResult | null>(null);
  const [addingToLab, setAddingToLab] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Custom Threshold state
  const [customCTR, setCustomCTR] = useState<number>(0.02);
  const [customCVR, setCustomCVR] = useState<number>(0.03);
  const [customRPM, setCustomRPM] = useState<number>(15000);
  const [showThresholdEdit, setShowThresholdEdit] = useState(false);

  // Fetch portfolio stats
  const fetchPortfolio = () => {
    fetch("/api/scout/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setPortfolio(data);
      })
      .catch(console.error)
      .finally(() => setLoadingPortfolio(false));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setAddedProductId(null);
    try {
      const res = await fetch("/api/scout/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: ProductScoutResult = await res.json();
      setScoutResult(data);
      if (data.testingPlan?.successCriteria) {
        setCustomCTR(data.testingPlan.successCriteria.minimumCTR);
        setCustomCVR(data.testingPlan.successCriteria.minimumCVR);
        setCustomRPM(data.testingPlan.successCriteria.minimumRPM || 15000);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAddToLab = async () => {
    if (!scoutResult) return;
    setAddingToLab(true);
    try {
      const payloadResult: ProductScoutResult = {
        ...scoutResult,
        testingPlan: {
          ...scoutResult.testingPlan,
          userCustomThreshold: {
            minimumCTR: customCTR,
            minimumCVR: customCVR,
            minimumRPM: customRPM,
          },
        },
      };

      const res = await fetch("/api/scout/add-to-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: form,
          scoutResult: payloadResult,
        }),
      });
      const data = await res.json();
      if (data.success && data.product?.id) {
        setAddedProductId(data.product.id);
        fetchPortfolio();
      }
    } catch (err) {
      console.error("Add to lab error:", err);
    } finally {
      setAddingToLab(false);
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "HIGH OPPORTUNITY":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "TEST":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "LOW SIGNAL":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-md gradient-primary">
              <Compass className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Decision & Intelligence Layer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Product Scout Engine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analisis kelayakan produk affiliate sebelum dipromosikan: SCALE, TEST, OPTIMIZE, atau KILL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Layers className="h-4 w-4" /> Buka Product Lab
          </Link>
          <AIStatusBadge />
        </div>
      </div>

      {/* Product Portfolio Overview Banner */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Product Lifecycle Portfolio</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Total {portfolio?.totalProducts || 0} Produk Terdaftar
          </span>
        </div>

        {loadingPortfolio ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* SCALE */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition-all hover:border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">SCALE</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{portfolio?.counts.scale || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Winning Product</p>
            </div>

            {/* TESTING */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 transition-all hover:border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-400">TESTING</span>
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{portfolio?.counts.testing || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Uji Validasi Awal</p>
            </div>

            {/* OPTIMIZE */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 transition-all hover:border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-400">OPTIMIZE</span>
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{portfolio?.counts.optimize || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Hook / Intent Fix</p>
            </div>

            {/* KILL */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 transition-all hover:border-rose-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-400">KILL</span>
                <XCircle className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{portfolio?.counts.kill || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Hentikan Konten</p>
            </div>

            {/* DISCOVERED */}
            <div className="rounded-xl border border-border bg-secondary/30 p-3.5 transition-all hover:border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">DISCOVERED</span>
                <Compass className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{portfolio?.counts.discovered || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Menunggu Uji</p>
            </div>

            {/* HIDDEN GEMS */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 transition-all hover:border-cyan-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                  <Gem className="h-3.5 w-3.5" /> HIDDEN GEM
                </span>
                <Flame className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-cyan-300 mt-2">{portfolio?.counts.hiddenGems || 0}</p>
              <p className="text-[11px] text-cyan-200/70 mt-0.5">High CVR, Low Views</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Scouting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Form Evaluasi Produk Baru
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Masukkan spesifikasi produk affiliate untuk dihitung Opportunity Score 7 dimensi.
            </p>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Mandoline Slicer 6-in-1"
                className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Kitchen & Home">Kitchen & Home</option>
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                  <option value="Gadget & Electronics">Gadget & Electronics</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Otomotif & Cleaning">Otomotif & Cleaning</option>
                  <option value="General">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Komisi (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Harga Produk (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimasi Komisi/Sale</label>
                <div className="h-[38px] rounded-lg border border-border/50 bg-secondary/20 px-3.5 flex items-center text-xs font-semibold text-emerald-400">
                  {formatCurrency((form.price * form.commissionRate) / 100)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Target Buyer Ideal
              </label>
              <input
                type="text"
                value={form.targetBuyer}
                onChange={(e) => setForm({ ...form, targetBuyer: e.target.value })}
                placeholder="Contoh: Ibu muda & pekerja yang butuh masak praktis"
                className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Deskripsi & Masalah Yang Diselesaikan
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Jelaskan fungsi utama, solusi, dan alasan kenapa penonton butuh barang ini..."
                className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Link Produk / Affiliate URL
              </label>
              <input
                type="url"
                value={form.productUrl}
                onChange={(e) => setForm({ ...form, productUrl: e.target.value })}
                placeholder="https://tokopedia.com/... atau https://shopee.co.id/..."
                className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={evaluating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {evaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menghitung Skor 7 Dimensi...
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4" /> Evaluate Product
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!scoutResult ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium text-foreground">Belum Ada Produk Dievaluasi</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Isi form di samping dan klik <strong>&quot;Evaluate Product&quot;</strong> untuk menghitung peluang
                affiliate secara objektif berdasarkan 7 dimensi konversi.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score & Category Header Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(scoutResult.category)}`}>
                        {scoutResult.category}
                      </span>
                      <span className="rounded-md border border-border/60 bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {scoutResult.dataSource}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{form.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {form.category} • {formatCurrency(form.price)} • Komisi {form.commissionRate}%
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScoreGauge score={scoutResult.score} size="lg" />
                  </div>
                </div>

                {/* 7 Dimensions Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skor 7 Dimensi Kelayakan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Demand Potential", val: scoutResult.breakdown.demandPotential, weight: "15%" },
                      { label: "Content Potential", val: scoutResult.breakdown.contentPotential, weight: "15%" },
                      { label: "Purchase Intent", val: scoutResult.breakdown.purchaseIntent, weight: "15%" },
                      { label: "Commission Attractiveness", val: scoutResult.breakdown.commissionAttractiveness, weight: "15%" },
                      { label: "Competition Health (Risk)", val: scoutResult.breakdown.competitionRisk, weight: "10%" },
                      { label: "Problem Strength", val: scoutResult.breakdown.problemStrength, weight: "15%" },
                      { label: "Demonstration Strength", val: scoutResult.breakdown.demonstrationStrength, weight: "15%" },
                    ].map((d, i) => (
                      <div key={i} className="rounded-lg border border-border/60 bg-secondary/30 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{d.label}</span>
                          <span className="font-semibold text-primary">{d.val}/100</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full gradient-primary transition-all duration-500"
                            style={{ width: `${d.val}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right">Bobot {d.weight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why & Risks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Kenapa Layak Dipromosikan?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {scoutResult.why}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Risiko & Hambatan
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {scoutResult.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3 Best Angles */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-indigo-400" /> Rekomendasi Angle Paling Efektif
                  </h4>
                  <div className="space-y-1.5">
                    {scoutResult.bestAngles.map((a, i) => (
                      <div key={i} className="rounded-lg border border-border/70 bg-card p-3 text-xs text-muted-foreground flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testing Plan Section */}
                <div className="rounded-xl border border-border bg-secondary/20 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Rencana Pengujian (Testing Plan)
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {scoutResult.testingPlan.testDays} Hari • {scoutResult.testingPlan.videoCount} Video Awal • {scoutResult.testingPlan.platforms.join(", ")}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowThresholdEdit(!showThresholdEdit)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      {showThresholdEdit ? "Tutup Threshold" : "Atur Threshold"}
                    </button>
                  </div>

                  {/* AI Testing Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Kriteria Sukses:</span>
                      <span className="text-[10px] uppercase font-semibold text-primary/80 tracking-wide">
                        {scoutResult.testingPlan.thresholdType}
                      </span>
                    </div>

                    {showThresholdEdit ? (
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">Min. CTR (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(customCTR * 100).toFixed(1)}
                            onChange={(e) => setCustomCTR(Number(e.target.value) / 100)}
                            className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">Min. CVR (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(customCVR * 100).toFixed(1)}
                            onChange={(e) => setCustomCVR(Number(e.target.value) / 100)}
                            className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">Min. RPM (Rp)</label>
                          <input
                            type="number"
                            step="1000"
                            value={customRPM}
                            onChange={(e) => setCustomRPM(Number(e.target.value))}
                            className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg border border-border bg-card p-2">
                          <p className="text-[10px] text-muted-foreground">Min. CTR</p>
                          <p className="text-sm font-bold text-foreground">{(customCTR * 100).toFixed(1)}%</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-2">
                          <p className="text-[10px] text-muted-foreground">Min. CVR</p>
                          <p className="text-sm font-bold text-foreground">{(customCVR * 100).toFixed(1)}%</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-2">
                          <p className="text-[10px] text-muted-foreground">Min. RPM</p>
                          <p className="text-sm font-bold text-foreground">Rp {customRPM.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5 Recommended Hooks */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-medium text-foreground">5 Hook Rekomendasi Uji:</p>
                    <div className="space-y-1">
                      {scoutResult.testingPlan.hooks.map((h, i) => (
                        <div key={i} className="rounded-md border border-border/40 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary">#{i + 1}</span>
                          <span className="italic">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Goal */}
                  <div className="rounded-lg bg-card/80 p-3 text-xs text-muted-foreground border border-border/60">
                    <strong className="text-foreground font-semibold">Target Validasi: </strong>
                    {scoutResult.expectedGoal}
                  </div>
                </div>

                {/* Action CTA: Add to Product Lab */}
                <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {addedProductId ? (
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-4 w-4" /> Berhasil ditambahkan ke Product Lab!
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Simpan hasil analisis dan testing plan ke database untuk mulai produksi konten.
                      </p>
                    )}
                  </div>

                  {addedProductId ? (
                    <Link
                      href={`/products/${addedProductId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Buka Detail Produk <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToLab}
                      disabled={addingToLab}
                      className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-primary/20"
                    >
                      {addingToLab ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Add to Product Lab
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
