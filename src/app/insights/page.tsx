"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  BrainCircuit, Loader2, Lightbulb, TrendingUp, TrendingDown,
  Sparkles, FlaskConical, BarChart3, ArrowDown, CheckCircle, AlertTriangle,
  Package, Search as SearchIcon, FileText, Upload, Eye, Zap, Copy, Check, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInsightResult, NextContentConcept } from "@/lib/ai/types";

const pipelineSteps = [
  { key: "idea", label: "IDEA", icon: Lightbulb, description: "Temukan produk potensial", href: "/products", color: "text-amber-400" },
  { key: "product", label: "PRODUCT", icon: Package, description: "Input data produk", href: "/products", color: "text-blue-400" },
  { key: "analysis", label: "ANALYSIS", icon: SearchIcon, description: "AI analisis produk", href: "/products", color: "text-purple-400" },
  { key: "content", label: "CONTENT", icon: FileText, description: "Generate strategi konten", href: "/content", color: "text-emerald-400" },
  { key: "publish", label: "PUBLISH", icon: Upload, description: "Upload & publish video", href: "#", color: "text-pink-400" },
  { key: "performance", label: "PERFORMANCE", icon: Eye, description: "Catat data performa", href: "/performance", color: "text-orange-400" },
  { key: "ai-analysis", label: "AI ANALYSIS", icon: BrainCircuit, description: "AI analisis performa", href: "/performance", color: "text-cyan-400" },
  { key: "next", label: "NEXT CONTENT", icon: Zap, description: "Buat konten berikutnya", href: "/insights", color: "text-primary" },
];

export default function InsightsPage() {
  const [data, setData] = useState<AIInsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchInsights = () => {
    setLoading(true);
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerateNext = async () => {
    setGeneratingNext(true);
    try {
      const res = await fetch("/api/insights/next-content", { method: "POST" });
      if (res.ok) {
        const nextContent = await res.json();
        setData((prev) => (prev ? { ...prev, nextContent } : null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingNext(false);
    }
  };

  const handleCopyConcept = (concept: NextContentConcept, idx: number) => {
    const text = `TITLE: ${concept.title}\nHOOK: ${concept.hook}\nANGLE: ${concept.angle}\nCONCEPT: ${concept.concept}\nGOAL: ${concept.expectedGoal}\nDATA GROUNDING: ${concept.basedOnPattern}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Decision Engine & AI Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance Learning, Pattern Detection & Next Content Planning</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh Insight
          </button>
          <AIStatusBadge />
        </div>
      </div>

      {/* Content Pipeline */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-6">Affiliate Commerce Pipeline</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 overflow-x-auto pb-2">
          {pipelineSteps.map((step, idx) => (
            <div key={step.key} className="flex items-center gap-2 sm:gap-0 shrink-0">
              <Link
                href={step.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/30 p-4 w-28 hover:bg-secondary/60 hover:border-primary/20 transition-all group"
              >
                <step.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", step.color)} />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{step.label}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{step.description}</span>
              </Link>
              {idx < pipelineSteps.length - 1 && (
                <ArrowDown className="h-4 w-4 text-muted-foreground sm:rotate-[-90deg] shrink-0 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Mengevaluasi pola performa dan merumuskan keputusan...</p>
        </div>
      ) : !data ? (
        <EmptyState
          icon={<BrainCircuit className="h-8 w-8" />}
          title="Belum Ada Data untuk Dianalisis"
          description="Publish konten dan input data performanya untuk mendapatkan AI Pattern Analysis dan rekomendasi."
          action={
            <Link href="/performance" className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <BarChart3 className="h-4 w-4" /> Input Data Performa
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Data Sufficiency Banner */}
          <div className={cn(
            "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
            data.sufficiency.tier === "insufficient"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : data.sufficiency.tier === "early"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          )}>
            <div className="flex items-start sm:items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/50 border border-current">
                    {data.sufficiency.confidenceLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">({data.sufficiency.recordCount} performance records)</span>
                </div>
                <p className="text-xs mt-1 text-foreground/90">{data.sufficiency.message}</p>
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          {data.recommendation && (
            <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Strategic Decision Engine</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">{data.recommendation.headline}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{data.recommendation.reason}</p>
              </div>
              <button
                onClick={handleGenerateNext}
                disabled={generatingNext}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {generatingNext ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {generatingNext ? "Generating..." : "Generate Next 5 Contents"}
              </button>
            </div>
          )}

          {/* 4 Analytics Grid (WINS, LOSSES, PATTERNS, OPPORTUNITIES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WINS */}
            <div className="rounded-xl border border-emerald-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-foreground">WINS (Winning Formula)</h3>
              </div>
              <div className="space-y-3">
                {data.wins.winningProduct && (
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs">
                    <span className="font-semibold text-emerald-400">Winning Product:</span>
                    <p className="font-medium text-foreground mt-0.5">{data.wins.winningProduct.name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{data.wins.winningProduct.reason}</p>
                  </div>
                )}
                {data.wins.winningAngle && (
                  <div className="rounded-lg bg-secondary/40 border border-border p-3 text-xs">
                    <span className="font-semibold text-primary">Winning Angle:</span>
                    <p className="font-medium text-foreground mt-0.5">{data.wins.winningAngle.name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{data.wins.winningAngle.reason}</p>
                  </div>
                )}
                {data.wins.winningHook && (
                  <div className="rounded-lg bg-secondary/40 border border-border p-3 text-xs">
                    <span className="font-semibold text-amber-400">Winning Hook:</span>
                    <p className="font-medium text-foreground mt-0.5 italic">"{data.wins.winningHook.text}"</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{data.wins.winningHook.reason}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-secondary/20 p-2.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Winning Platform</span>
                    <p className="font-semibold text-foreground mt-0.5">{data.wins.winningPlatform?.name || "TikTok"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/20 p-2.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Winning Duration</span>
                    <p className="font-semibold text-foreground mt-0.5">{data.wins.winningDuration?.duration || "10 detik"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LOSSES */}
            <div className="rounded-xl border border-red-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <h3 className="text-base font-semibold text-foreground">LOSSES (Conversion Leaks)</h3>
              </div>
              {data.wins.losses.length === 0 ? (
                <div className="rounded-lg bg-secondary/30 p-4 text-xs text-muted-foreground text-center">
                  Tidak terdeteksi anomali kebocoran konversi signifikan. Semua konten bertrafik tinggi mempertahankan CVR yang wajar.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.wins.losses.map((loss, idx) => (
                    <div key={idx} className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-foreground truncate max-w-[200px]">{loss.content}</span>
                        <span className="text-red-400 font-semibold">{loss.views.toLocaleString("id-ID")} Views | CVR {(loss.cvr * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">{loss.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PATTERNS */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-foreground">PATTERNS (Data Rules)</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                {data.wins.patterns.map((pattern, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed text-foreground/90">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* OPPORTUNITIES */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-semibold text-foreground">OPPORTUNITIES (Growth Avenues)</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                {data.wins.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed text-foreground/90">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* NEXT CONTENT (5 Data-Grounded Concepts) */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> NEXT CONTENT (5 Concepts Grounded in Data)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Setiap konsep dirancang langsung dari evaluasi metrik historis untuk memaksimalkan peluang konversi.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit">
                Decision Engine Output
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.nextContent.concepts.map((concept, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-secondary/20 p-5 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground leading-snug">{concept.title}</h4>
                      <button
                        onClick={() => handleCopyConcept(concept, idx)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors shrink-0"
                        title="Copy Concept"
                      >
                        {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Hook:</span>
                        <p className="text-foreground italic mt-0.5">"{concept.hook}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Angle:</span>
                        <p className="text-primary font-medium">{concept.angle}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Konsep Visual:</span>
                        <p className="text-muted-foreground leading-relaxed mt-0.5">{concept.concept}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary block mb-0.5">Data Grounding:</span>
                      {concept.basedOnPattern}
                    </div>
                    <Link
                      href="/content"
                      className="inline-flex items-center justify-center w-full rounded-lg bg-secondary py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Bawa ke Content Lab →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
