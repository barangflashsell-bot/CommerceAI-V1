"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import { ScoreGauge } from "@/components/shared/score-gauge";
import {
  Package,
  Star,
  FileText,
  ShoppingCart,
  Percent,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";

interface DashboardData {
  summary: {
    totalProducts: number;
    potentialProducts: number;
    totalContent: number;
    totalOrders: number;
    conversionRate: number;
    totalRevenue: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    opportunityScore: number;
    orders: number;
    clicks: number;
    views: number;
  }>;
  bestContent: Array<{
    contentId: string;
    productName: string;
    platform: string;
    views: number;
    clicks: number;
    orders: number;
    ctr: number;
    cvr: number;
    hook: string;
    angle: string;
  }>;
  highViewsLowConversion: Array<{
    contentId: string;
    productName: string;
    views: number;
    cvr: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalProducts: 0,
    potentialProducts: 0,
    totalContent: 0,
    totalOrders: 0,
    conversionRate: 0,
    totalRevenue: 0,
  };

  const isEmpty = summary.totalProducts === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">CommerceAI</h1>
            <AIStatusBadge />
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            AI Commerce Machine untuk menemukan produk, membuat konten, dan membaca performa.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Zap className="h-4 w-4" />
          Mulai Sekarang
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Produk"
          value={summary.totalProducts}
          icon={<Package className="h-5 w-5" />}
          gradient="gradient-primary"
        />
        <MetricCard
          label="Produk Potensial"
          value={summary.potentialProducts}
          icon={<Star className="h-5 w-5" />}
          gradient="gradient-accent"
        />
        <MetricCard
          label="Konten Dibuat"
          value={summary.totalContent}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Total Order"
          value={summary.totalOrders}
          icon={<ShoppingCart className="h-5 w-5" />}
          gradient="gradient-warm"
        />
        <MetricCard
          label="Conversion Rate"
          value={formatPercent(summary.conversionRate)}
          icon={<Percent className="h-5 w-5" />}
        />
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Belum Ada Produk"
          description="Tambahkan produk affiliate pertama Anda untuk memulai analisis AI dan strategi konten."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Tambah Produk <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produk yang Perlu Diperhatikan */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">Produk yang Perlu Diperhatikan</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ranking berdasarkan Opportunity Score</p>
              </div>
              <Link href="/products" className="text-xs text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
            {data?.topProducts && data.topProducts.length > 0 ? (
              <div className="divide-y divide-border">
                {data.topProducts.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <ScoreGauge score={product.opportunityScore || 0} size="sm" />
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                      <span className="text-xs text-muted-foreground">{formatNumber(product.views)} views</span>
                      <span className="text-xs text-muted-foreground">{product.orders} orders</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada produk yang dianalisis. Buka Product Lab untuk menganalisis produk.
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">AI Recommendation</h2>
              </div>
              {data?.topProducts && data.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {data.topProducts.slice(0, 2).map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg bg-primary/5 border border-primary/10 p-3"
                    >
                      <p className="text-xs text-foreground leading-relaxed">
                        Produk <span className="font-semibold text-primary">{p.name}</span> memiliki
                        opportunity score {p.opportunityScore}/100.
                        {p.orders > 0
                          ? ` Sudah menghasilkan ${p.orders} orders. Buat variasi konten untuk meningkatkan konversi.`
                          : " Buat konten pertama untuk produk ini menggunakan Content Lab."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Analisis produk untuk mendapatkan rekomendasi AI.
                </p>
              )}
            </div>

            {/* Content Performance Quick */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-info" />
                <h2 className="text-base font-semibold text-foreground">Content Performance</h2>
              </div>
              {data?.bestContent && data.bestContent.length > 0 ? (
                <div className="space-y-2">
                  {data.bestContent.slice(0, 3).map((c) => (
                    <div
                      key={c.contentId}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{c.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{c.platform} · {c.angle || "N/A"}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary">{c.orders} orders</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada data performa konten.
                </p>
              )}
            </div>

            {/* Warnings */}
            {data?.highViewsLowConversion && data.highViewsLowConversion.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">Perlu Perbaikan</h3>
                </div>
                {data.highViewsLowConversion.map((c) => (
                  <p key={c.contentId} className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{c.productName}</span> — {formatNumber(c.views)} views tapi CVR hanya {formatPercent(c.cvr || 0)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
