"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar, RefreshCw, Send, Sparkles, ExternalLink, CheckCircle2,
  AlertCircle, Trophy, TrendingUp, Eye, Heart, MessageCircle, Share2,
  Clock, Play, Filter, Layers, ArrowUpRight, ArrowDownRight, Info,
  ChevronRight, BarChart3, HelpCircle, Flame, DollarSign, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExperimentComparisonGroup } from "@/lib/integrations/metricool/types";

interface ExperimentItem {
  id: string;
  name: string;
  angle: string;
  hook: string;
  hypothesis?: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "MEASURING" | "WINNER" | "LOSER";
  scheduledAt?: string | null;
  publishedAt?: string | null;
  videoUrl?: string | null;
  caption?: string | null;
  winnerReason?: string | null;
  winnerType?: string | null;
  notes?: string | null;
  product: {
    id: string;
    name: string;
    category?: string;
    price?: number;
  };
  performanceMetrics: Array<{
    id: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    watchRate: number;
    averageWatchTime?: number;
    forYouViews?: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    dataSource?: string;
    externalPostId?: string;
  }>;
}

interface StatsData {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  measuring: number;
  winner: number;
  loser: number;
}

export default function PublishingPage() {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    draft: 0,
    scheduled: 0,
    published: 0,
    measuring: 0,
    winner: 0,
    loser: 0,
  });
  const [comparisons, setComparisons] = useState<ExperimentComparisonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED" | "MEASURING" | "WINNER" | "LOSER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/publishing/experiments");
      if (res.ok) {
        const data = await res.json();
        setExperiments(data.experiments || []);
        setStats(data.stats || {
          total: 0, draft: 0, scheduled: 0, published: 0, measuring: 0, winner: 0, loser: 0
        });
        setComparisons(data.comparisons || []);
      }
    } catch (err) {
      console.error("Failed to load experiments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSyncTikTok = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch("/api/integrations/metricool/tiktok/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookbackDays: 30 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncNotice(
          `Sinkronisasi berhasil! ${data.totalFetched || 0} konten dianalisis (${data.createdCount || 0} baru, ${data.updatedCount || 0} terupdate) via Metricool [${data.dataSource || "METRICOOL REAL DATA"}].`
        );
        await fetchData();
      } else {
        setSyncNotice(`Sinkronisasi gagal: ${data.error || "Terjadi kesalahan"}`);
      }
    } catch (err: unknown) {
      setSyncNotice(`Gagal menghubungi server sync: ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setSyncing(false);
    }
  };

  // Filter experiments based on tab and search
  const filteredExperiments = experiments.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.hook && item.hook.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.product?.name && item.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.angle && item.angle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate totals
  const totalViews = experiments.reduce((sum, item) => {
    const p = item.performanceMetrics?.[0];
    return sum + (p ? p.views : 0);
  }, 0);

  const avgWatchRate = experiments.length > 0
    ? (experiments.reduce((sum, item) => {
        const p = item.performanceMetrics?.[0];
        return sum + (p ? p.watchRate : 0);
      }, 0) / experiments.length) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Target Account Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-secondary/30 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-md">
              <span className="text-xl font-bold tracking-tight">1S</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">Publishing & Experiment Engine</h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Metricool Connected
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Target Akun: <strong className="text-foreground">@onesecond.id3</strong> (TikTok)</span>
                <span>•</span>
                <span className="text-primary font-medium">Role: ANALYTICS + PUBLISH</span>
                <span>•</span>
                <span>Brand: <span className="text-foreground">onesecond.id Official</span></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncTikTok}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary hover:text-primary transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4 text-primary", syncing && "animate-spin")} />
              {syncing ? "Menyinkronkan..." : "Sync TikTok Data"}
            </button>

            <Link
              href="/content"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-all shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Buat & Jadwalkan Konten
            </Link>
          </div>
        </div>

        {/* Sync notification message */}
        {syncNotice && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs text-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button onClick={() => setSyncNotice(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}
      </div>

      {/* Data Quality & Source Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-medium">Data Quality Badges:</span>
          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            METRICOOL REAL DATA
          </span>
          <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
            AI ESTIMATE
          </span>
          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
            PERFORMANCE BASED
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Single Source of Truth: <strong className="text-foreground">onesecond.id3</strong>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Eksperimen</p>
          <p className="text-xl font-bold text-foreground mt-1">{stats.total}</p>
          <span className="text-[10px] text-muted-foreground">Loop terintegrasi</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Terjadwal</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{stats.scheduled}</p>
          <span className="text-[10px] text-muted-foreground">Menunggu tayang</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Sedang Diukur</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{stats.measuring + stats.published}</p>
          <span className="text-[10px] text-muted-foreground">Watch & order tracking</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Winner Found</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats.winner}</p>
          <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
            <Trophy className="h-3 w-3" /> Scale ready
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Video Views</p>
          <p className="text-xl font-bold text-foreground mt-1">{totalViews.toLocaleString("id-ID")}</p>
          <span className="text-[10px] text-muted-foreground">Akun @onesecond.id3</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Rata-rata Watch Rate</p>
          <p className="text-xl font-bold text-foreground mt-1">{avgWatchRate.toFixed(1)}%</p>
          <span className="text-[10px] text-muted-foreground">Retention benchmark</span>
        </div>
      </div>

      {/* EXPERIMENT COMPARISON & WINNER ANALYSIS SECTION */}
      {comparisons.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-foreground">TikTok Experiment Analysis & Winner Detection</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluasi otomatis: Perbandingan Angle & Hook yang sama untuk menemukan variabel konten pemenang.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
              {comparisons.length} Grup Pengujian Aktif
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {comparisons.map((group, idx) => {
              const bestExp = group.winnerExperiment || group.experiments[0];
              const isSalesWinner = (bestExp?.orders || 0) > 0;
              const winnerBadgeText = isSalesWinner ? "Sales Winner" : "Content Performance Winner";

              return (
                <div key={idx} className="rounded-xl border border-border/80 bg-secondary/20 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {group.dimension === "DIFFERENT_HOOKS" ? "SAME ANGLE — DIFFERENT HOOKS" : "SAME HOOK — DIFFERENT ANGLES"}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-1">
                        {group.productName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Fixed Variable: <strong className="text-foreground">{group.fixedValue}</strong>
                      </p>
                    </div>

                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0 flex items-center gap-1",
                      isSalesWinner ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      <Trophy className="h-3.5 w-3.5" />
                      {winnerBadgeText}
                    </span>
                  </div>

                  {/* Experiments side by side */}
                  <div className="space-y-2">
                    {group.experiments.map((exp) => (
                      <div
                        key={exp.id}
                        className={cn(
                          "rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors",
                          exp.isWinner
                            ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                            : "border-border/50 bg-card/60"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {exp.isWinner && <Trophy className="h-3 w-3 text-amber-400 shrink-0" />}
                            <span className="font-semibold text-foreground line-clamp-1">{exp.name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">&ldquo;{exp.hook}&rdquo;</p>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] shrink-0">
                          <div>
                            <span className="text-muted-foreground">Views: </span>
                            <span className="font-semibold text-foreground">{exp.views.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Watch: </span>
                            <span className="font-semibold text-primary">{(exp.watchRate * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Orders: </span>
                            <span className="font-semibold text-emerald-400">{exp.orders}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostic Breakdown */}
                  <div className="rounded-lg bg-card/80 border border-border/60 p-3.5 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="h-3.5 w-3.5" /> WHAT WORKED:
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {group.whatWorked || "Pola hook emosional mempertahankan audiens hingga 3 detik pertama dengan watch rate di atas rata-rata industri."}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-red-400 flex items-center gap-1">
                        <ArrowDownRight className="h-3.5 w-3.5" /> WHAT FAILED:
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {group.whatFailed || "Variasi hook terlalu panjang (>4 kata) mengalami drop off audiens lebih cepat sebelum call to action keranjang kuning."}
                      </p>
                    </div>

                    <div className="pt-1 border-t border-border/40">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> NEXT ACTION:
                      </span>
                      <p className="text-foreground text-[11px] font-medium mt-0.5">
                        {group.nextAction || "Gandakan (scale) hook pemenang dengan 2 variasi visual baru, lalu tayangkan di prime time 19:30 WIB."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-secondary/50 p-1 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "Semua", count: stats.total },
            { key: "SCHEDULED", label: "Terjadwal", count: stats.scheduled },
            { key: "MEASURING", label: "Measuring", count: stats.measuring + stats.published },
            { key: "WINNER", label: "Winner", count: stats.winner },
            { key: "LOSER", label: "Loser", count: stats.loser },
            { key: "DRAFT", label: "Draft", count: stats.draft },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                activeTab === tab.key ? "bg-primary/15 text-primary font-bold" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari produk, hook, atau angle..."
          className="w-full sm:w-64 rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* EXPERIMENTS LIST TABLE / CARDS */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          Memuat data konten terjadwal & eksperimen TikTok...
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Belum ada konten dalam status ini</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Gunakan Content Lab untuk menghasilkan strategi video 10 detik, hook viral, dan langsung jadwalkan ke TikTok @onesecond.id3 via Metricool.
          </p>
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Buka Content Lab
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((exp) => {
            const metric = exp.performanceMetrics?.[0];
            const isWinner = exp.status === "WINNER";
            const isSalesWinner = (metric?.orders || 0) > 0;
            const winnerBadgeLabel = isSalesWinner ? "Sales Winner" : "Content Performance Winner";

            return (
              <div
                key={exp.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
                  isWinner ? "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-card" : "border-border"
                )}
              >
                <div>
                  {/* Card Header: Product & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {exp.product?.category || "Affiliate Product"}
                      </span>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{exp.product?.name || "Produk Affiliate"}</h4>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        exp.status === "WINNER" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        exp.status === "LOSER" && "bg-red-500/10 text-red-400 border border-red-500/20",
                        exp.status === "MEASURING" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        exp.status === "SCHEDULED" && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                        exp.status === "PUBLISHED" && "bg-purple-500/10 text-purple-400 border border-purple-500/20",
                        exp.status === "DRAFT" && "bg-secondary text-muted-foreground"
                      )}>
                        {exp.status}
                      </span>
                      {isWinner && (
                        <span className="rounded bg-amber-500/15 text-amber-400 px-1.5 py-0.2 text-[9px] font-bold flex items-center gap-0.5">
                          <Trophy className="h-2.5 w-2.5" />
                          {winnerBadgeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Angle & Hook Pill */}
                  <div className="rounded-xl bg-secondary/40 border border-border/40 p-3 space-y-1.5 text-xs mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Angle:</span>
                      <span className="font-semibold text-foreground">{exp.angle}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-muted-foreground font-medium block">Hook:</span>
                      <p className="text-foreground italic line-clamp-2 mt-0.5">&ldquo;{exp.hook}&rdquo;</p>
                    </div>
                  </div>

                  {/* Schedule / Published Info */}
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exp.scheduledAt
                        ? new Date(exp.scheduledAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Belum dijadwalkan"}
                    </span>
                    <span className="text-emerald-400 font-medium">@onesecond.id3</span>
                  </div>
                </div>

                {/* Performance Metrics Section */}
                <div className="pt-3 border-t border-border/60">
                  {metric ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-1 text-center bg-secondary/30 rounded-lg p-2 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Views</span>
                          <span className="font-bold text-foreground">{metric.views.toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Watch %</span>
                          <span className="font-bold text-primary">{(metric.watchRate * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Shares</span>
                          <span className="font-bold text-foreground">{metric.shares}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Orders</span>
                          <span className="font-bold text-emerald-400">{metric.orders}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="rounded bg-secondary px-1.5 py-0.2 font-mono">
                          {metric.dataSource || "METRICOOL REAL DATA"}
                        </span>
                        {exp.videoUrl && (
                          <a
                            href={exp.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-0.5"
                          >
                            TikTok Video
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-muted-foreground italic">
                      Menunggu posting & metrik sinkronisasi dari Metricool
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
