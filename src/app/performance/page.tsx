"use client";

import { useState, useEffect, useCallback } from "react";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  BarChart3, Plus, X, Loader2, Trash2, BrainCircuit,
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight, CheckCircle, XCircle,
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { Product, PerformanceMetric } from "@/lib/db";
import type { PerformanceAnalysisResult } from "@/lib/ai/types";

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PerformanceAnalysisResult | null>(null);
  const [form, setForm] = useState({
    productId: "", contentId: "", date: new Date().toISOString().split("T")[0],
    platform: "TikTok", views: "", likes: "", comments: "", shares: "",
    clicks: "", addToCart: "", orders: "", commission: "",
    videoConcept: "", hook: "", angle: "",
  });

  const fetchData = useCallback(() => {
    Promise.all([
      fetch("/api/performance").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([m, p]) => { setMetrics(m); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ productId: "", contentId: "", date: new Date().toISOString().split("T")[0], platform: "TikTok", views: "", likes: "", comments: "", shares: "", clicks: "", addToCart: "", orders: "", commission: "", videoConcept: "", hook: "", angle: "" });
        setShowForm(false);
        fetchData();
      }
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/performance/analyze", { method: "POST" });
      const data = await res.json();
      setAnalysis(data);
    } catch (error) { console.error(error); }
    finally { setAnalyzing(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data performa ini?")) return;
    try {
      await fetch(`/api/performance?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Performance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Catat dan analisis performa konten Anda</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAnalyze} disabled={analyzing || metrics.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
            {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><BrainCircuit className="h-4 w-4" /> AI Analyze</>}
          </button>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Tambah Data
          </button>
        </div>
      </div>

      {/* Performance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Tambah Data Performa</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Produk *</label>
                  <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Pilih produk...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content ID</label>
                  <input value={form.contentId} onChange={(e) => setForm({ ...form, contentId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="VID-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tanggal *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Platform *</label>
                  <select required value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Views</label><input type="number" value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Likes</label><input type="number" value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Comments</label><input type="number" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Shares</label><input type="number" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Clicks *</label><input required type="number" value={form.clicks} onChange={(e) => setForm({ ...form, clicks: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Add to Cart</label><input type="number" value={form.addToCart} onChange={(e) => setForm({ ...form, addToCart: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Orders *</label><input required type="number" value={form.orders} onChange={(e) => setForm({ ...form, orders: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Commission (Rp)</label><input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Video Concept</label><input value={form.videoConcept} onChange={(e) => setForm({ ...form, videoConcept: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Problem Solution" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Hook</label><input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Hook yang digunakan..." /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Angle</label><input value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Problem → Solution" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Table */}
      {loading ? (
        <div className="h-64 rounded-xl border border-border bg-card animate-shimmer" />
      ) : metrics.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="Belum Ada Data Performa"
          description="Catat performa konten yang sudah dipublish untuk mendapatkan analisis AI."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Tambah Data Pertama
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Produk</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">ID</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Platform</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Views</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Clicks</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Orders</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">CTR</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">CVR</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Revenue</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.map((m) => {
                  const product = products.find((p) => p.id === m.productId);
                  return (
                    <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3 text-foreground font-medium">{product?.name || "—"}</td>
                      <td className="p-3 text-muted-foreground">{m.contentId || "—"}</td>
                      <td className="p-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{m.platform}</span></td>
                      <td className="p-3 text-right text-muted-foreground">{formatNumber(m.views)}</td>
                      <td className="p-3 text-right text-muted-foreground">{formatNumber(m.clicks)}</td>
                      <td className="p-3 text-right font-medium text-foreground">{m.orders}</td>
                      <td className="p-3 text-right text-muted-foreground">{formatPercent(m.ctr || 0)}</td>
                      <td className="p-3 text-right text-muted-foreground">{formatPercent(m.cvr || 0)}</td>
                      <td className="p-3 text-right font-medium text-primary">Rp{formatNumber(m.revenue || m.commission || 0)}</td>
                      <td className="p-3"><button onClick={() => handleDelete(m.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Performance Analysis</h2>
            <AIStatusBadge />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Worked */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" /> What Worked
              </h3>
              <ul className="space-y-2">
                {analysis.whatWorked.map((w, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 mt-0.5 text-emerald-400 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* What Failed */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" /> What Failed
              </h3>
              <ul className="space-y-2">
                {analysis.whatFailed.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <TrendingDown className="h-3 w-3 mt-0.5 text-red-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Why */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Why
              </h3>
              <ul className="space-y-2">
                {analysis.why.map((w, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Action */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" /> Next Action
              </h3>
              <ul className="space-y-2">
                {analysis.nextActions.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
