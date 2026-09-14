"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import {
  FlaskConical,
  Plus,
  X,
  Loader2,
  ArrowRight,
  Search,
  Trash2,
} from "lucide-react";
import { formatCurrency, getScoreLabel } from "@/lib/utils";
import type { Product } from "@/lib/db";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", link: "", category: "", price: "", commissionRate: "",
    imageUrl: "", targetAudience: "", description: "", advantages: "", problemSolved: "",
  });

  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchProducts = useCallback(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/scout/portfolio")
      .then((r) => r.json())
      .then(setPortfolioData)
      .catch(console.error);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", link: "", category: "", price: "", commissionRate: "", imageUrl: "", targetAudience: "", description: "", advantages: "", problemSolved: "" });
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (productId: string) => {
    setAnalyzing(productId);
    try {
      await fetch(`/api/products/${productId}/analyze`, { method: "POST" });
      fetchProducts();
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const getProductStatus = (productId: string, fallbackStatus?: string) => {
    if (portfolioData?.products) {
      const found = portfolioData.products.find((p: any) => p.id === productId);
      if (found) {
        return {
          status: found.status,
          isHiddenGem: found.isHiddenGem,
          rpm: found.rpm,
        };
      }
    }
    return {
      status: fallbackStatus || "DISCOVERED",
      isHiddenGem: false,
      rpm: 0,
    };
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatus === "ALL") return true;

    const { status, isHiddenGem } = getProductStatus(p.id, p.status);
    if (selectedStatus === "HIDDEN_GEMS") return isHiddenGem;
    return status === selectedStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Lab</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Katalog & analisis peluang produk affiliate terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scout"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            Product Scout
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Tambah Manual
          </button>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Semua", count: products.length },
            { id: "SCALE", label: "Scale", count: portfolioData?.counts?.scale },
            { id: "TESTING", label: "Testing", count: portfolioData?.counts?.testing },
            { id: "OPTIMIZE", label: "Optimize", count: portfolioData?.counts?.optimize },
            { id: "KILL", label: "Kill", count: portfolioData?.counts?.kill },
            { id: "HIDDEN_GEMS", label: "Hidden Gem", count: portfolioData?.counts?.hiddenGems },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatus === tab.id ? "bg-black/20 text-white" : "bg-border text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Tambah Produk Baru</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nama Produk *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Rak Piring Stainless Steel" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kategori *</label>
                  <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Home & Living" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Harga (Rp) *</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="89000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Komisi (%) *</label>
                  <input required type="number" step="0.1" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link Produk *</label>
                <input required value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://tokopedia.link/..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL Foto Produk</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target Audience *</label>
                <input required value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ibu rumah tangga, pengguna dapur" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Deskripsi Produk *</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Rak piring stainless steel 2 tingkat..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Keunggulan Produk *</label>
                <textarea required value={form.advantages} onChange={(e) => setForm({ ...form, advantages: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Anti karat, kokoh, mudah dipasang..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Masalah yang Diselesaikan *</label>
                <textarea required value={form.problemSolved} onChange={(e) => setForm({ ...form, problemSolved: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Dapur berantakan, piring bertumpuk..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-border bg-card animate-shimmer" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-8 w-8" />}
          title="Belum Ada Produk"
          description="Tambahkan produk affiliate untuk mulai menganalisis peluang dan menghasilkan strategi konten."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Tambah Produk Pertama
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const { status, isHiddenGem, rpm } = getProductStatus(product.id, product.status);
            return (
              <div
                key={product.id}
                className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Status Badges Header */}
                <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      status === "SCALE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : status === "TESTING"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : status === "OPTIMIZE"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : status === "KILL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {status}
                  </span>

                  {isHiddenGem && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      ★ HIDDEN GEM
                    </span>
                  )}

                  {rpm > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      RPM: <strong className="text-foreground">Rp {rpm.toLocaleString("id-ID")}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <Link href={`/products/${product.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  </div>
                  {product.opportunityScore ? (
                    <ScoreGauge score={product.opportunityScore} size="sm" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border">
                      <span className="text-[10px] text-muted-foreground">N/A</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {product.commissionRate}% komisi
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description}</p>

                {product.opportunityScore ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getScoreLabel(product.opportunityScore)}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Detail <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAnalyze(product.id)}
                      disabled={analyzing === product.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {analyzing === product.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
                      ) : (
                        "Analyze Product"
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
