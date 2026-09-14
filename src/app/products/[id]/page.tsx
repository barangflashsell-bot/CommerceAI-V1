"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import {
  ArrowLeft, Loader2, Target, AlertTriangle, ShoppingBag,
  Lightbulb, Sparkles, ChevronRight, TrendingUp, XCircle, Zap, Gem, Check, Sliders,
} from "lucide-react";
import { formatCurrency, getScoreColor, getScoreBgColor } from "@/lib/utils";
import type { Product } from "@/lib/db";
import type { ProductAnalysisResult, ContentAngle, ProductDecisionRecommendation, TestingPlanConfig } from "@/lib/ai/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysisResult | null>(null);
  const [decision, setDecision] = useState<ProductDecisionRecommendation | null>(null);
  const [testingPlan, setTestingPlan] = useState<TestingPlanConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [showThresholdEdit, setShowThresholdEdit] = useState(false);
  const [customCTR, setCustomCTR] = useState(0.02);
  const [customCVR, setCustomCVR] = useState(0.03);
  const [customRPM, setCustomRPM] = useState(15000);

  const fetchProduct = () => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        if (data.aiAnalysis) setAnalysis(data.aiAnalysis);
        if (data.decision) {
          setDecision(data.decision);
          if (data.decision.testingPlan) {
            setTestingPlan(data.decision.testingPlan);
            const crit = data.decision.testingPlan.userCustomThreshold || data.decision.testingPlan.successCriteria;
            if (crit) {
              setCustomCTR(crit.minimumCTR || 0.02);
              setCustomCVR(crit.minimumCVR || 0.03);
              setCustomRPM(crit.minimumRPM || 15000);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleSaveThreshold = async () => {
    setSavingThreshold(true);
    try {
      await fetch(`/api/products/${id}/testing-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minimumCTR: customCTR,
          minimumCVR: customCVR,
          minimumRPM: customRPM,
        }),
      });
      setShowThresholdEdit(false);
      fetchProduct();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingThreshold(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/products/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-muted-foreground">Produk tidak ditemukan</div>;
  }

  const breakdown = analysis?.breakdown;
  const breakdownItems = breakdown ? [
    { label: "Demand Potential", value: breakdown.demandPotential },
    { label: "Content Potential", value: breakdown.contentPotential },
    { label: "Problem-Solution Strength", value: breakdown.problemSolutionStrength },
    { label: "Purchase Intent", value: breakdown.purchaseIntent },
    { label: "Commission Attractiveness", value: breakdown.commissionAttractiveness },
    { label: "Competition Risk", value: breakdown.competitionRisk },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Product Lab
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      {/* Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
              </div>
              <AIStatusBadge />
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-foreground">
                {formatCurrency(product.price)}
              </span>
              <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                {product.commissionRate}% komisi
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* AI Recommendation Section */}
          {decision && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        AI Lifecycle Decision
                      </span>
                      <span className="rounded-md border border-border/80 bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {decision.dataSource}
                      </span>
                      {decision.isHiddenGem && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                          <Gem className="h-3 w-3" /> HIDDEN GEM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${
                          decision.status === "SCALE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : decision.status === "TESTING"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : decision.status === "OPTIMIZE"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : decision.status === "KILL"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-secondary text-foreground border-border"
                        }`}
                      >
                        {decision.recommendation}
                      </span>
                      {decision.subFocus && (
                        <span className="text-xs font-medium text-muted-foreground">
                          • {decision.subFocus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <p className="text-[10px] text-muted-foreground">Sampel Teruji</p>
                    <p className="text-sm font-semibold text-foreground">
                      {decision.metrics.sampleCount} Video ({decision.metrics.views.toLocaleString("id-ID")} Views)
                    </p>
                  </div>
                </div>

                {/* Key Affiliate Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground">CTR Video</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {(decision.metrics.ctr * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground">CVR Beli</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {(decision.metrics.cvr * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground">Total Orders</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {decision.metrics.orders}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground">RPM (Rev / 1K Views)</p>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">
                      Rp {decision.metrics.rpm.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Reasoning based on data */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-primary" /> Analisis & Alasan Keputusan AI:
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {decision.reasoning}
                  </p>
                </div>

                {/* Hidden Gem Alert if applicable */}
                {decision.isHiddenGem && decision.hiddenGemReason && (
                  <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 space-y-1">
                    <h4 className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Gem className="h-4 w-4 text-cyan-400" /> Sinyal Terdeteksi: Hidden Gem
                    </h4>
                    <p className="text-xs text-cyan-100/80 leading-relaxed">
                      {decision.hiddenGemReason}
                    </p>
                  </div>
                )}

                {/* Testing Plan Section if present */}
                {testingPlan && (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Testing Plan & Threshold Target
                      </h4>
                      <button
                        onClick={() => setShowThresholdEdit(!showThresholdEdit)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Sliders className="h-3 w-3" /> {showThresholdEdit ? "Batal" : "Sesuaikan Threshold"}
                      </button>
                    </div>

                    {showThresholdEdit ? (
                      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                        <p className="text-[11px] text-muted-foreground">
                          Kustomisasi tolok ukur kesuksesan untuk produk ini:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Target CTR (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={(customCTR * 100).toFixed(1)}
                              onChange={(e) => setCustomCTR(Number(e.target.value) / 100)}
                              className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Target CVR (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={(customCVR * 100).toFixed(1)}
                              onChange={(e) => setCustomCVR(Number(e.target.value) / 100)}
                              className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Target RPM (Rp)</label>
                            <input
                              type="number"
                              step="1000"
                              value={customRPM}
                              onChange={(e) => setCustomRPM(Number(e.target.value))}
                              className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSaveThreshold}
                          disabled={savingThreshold}
                          className="rounded gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {savingThreshold ? "Menyimpan..." : "Simpan Threshold Kustom"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded border border-border bg-card p-2">
                          <span className="text-[10px] text-muted-foreground block">Target CTR</span>
                          <strong className="text-foreground font-semibold">{(customCTR * 100).toFixed(1)}%</strong>
                        </div>
                        <div className="rounded border border-border bg-card p-2">
                          <span className="text-[10px] text-muted-foreground block">Target CVR</span>
                          <strong className="text-foreground font-semibold">{(customCVR * 100).toFixed(1)}%</strong>
                        </div>
                        <div className="rounded border border-border bg-card p-2">
                          <span className="text-[10px] text-muted-foreground block">Target RPM</span>
                          <strong className="text-foreground font-semibold">Rp {customRPM.toLocaleString("id-ID")}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Insight */}
            {analysis ? (
              <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Kenapa Produk Ini Layak Dipromosikan?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.whyPromote}</p>
              </div>

              {/* Target Buyer & Pain Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-info" /> Target Buyer
                  </h3>
                  <ul className="space-y-2">
                    {analysis.targetAudience.map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-info shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" /> Pain Point
                  </h3>
                  <ul className="space-y-2">
                    {analysis.painPoints.map((p, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-success" /> Buying Trigger
                  </h3>
                  <ul className="space-y-2">
                    {analysis.buyingTriggers.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> USP
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{analysis.sellingProposition}</p>
                </div>
              </div>

              {/* Content Angles */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Content Opportunities — Potential Angles</h2>
                <div className="space-y-3">
                  {analysis.contentAngles.map((angle: ContentAngle, i: number) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-secondary/50 p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{angle.name}</p>
                        <p className="text-xs text-muted-foreground">{angle.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getScoreColor(angle.score)}`}>{angle.score}</span>
                        <p className="text-[10px] text-muted-foreground">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Produk belum dianalisis oleh AI</p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Product"}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Score */}
        <div className="space-y-4">
          {analysis ? (
            <>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Product Opportunity Score
                </h3>
                <ScoreGauge score={analysis.opportunityScore} size="lg" label="AI Estimated Score" />
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{analysis.reasoning}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Score Breakdown</h3>
                {breakdownItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={`text-xs font-semibold ${getScoreColor(item.value)}`}>{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          item.value >= 80 ? "bg-emerald-500" :
                          item.value >= 60 ? "bg-blue-500" :
                          item.value >= 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/content?product=${id}`}
                className="flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full"
              >
                <Sparkles className="h-4 w-4" /> Buat Konten untuk Produk Ini
              </Link>
            </>
          ) : (
            <div className={`rounded-xl border p-6 text-center ${getScoreBgColor(0)}`}>
              <p className="text-sm text-muted-foreground">Klik "Analyze Product" untuk mendapatkan score</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
