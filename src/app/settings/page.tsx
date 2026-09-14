"use client";

import { useState, useEffect } from "react";
import { Bot, Cpu, Sparkles, CheckCircle, XCircle, AlertCircle, RefreshCw, Key, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderHealth } from "@/lib/ai/provider";

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    fetch("/api/settings/ai-status")
      .then((r) => r.json())
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Configuration & Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola AI Provider, periksa status koneksi, dan konfigurasi environment</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Check Health
        </button>
      </div>

      {/* Security Note */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-emerald-400">Server-Side Security Isolation</p>
          <p className="text-muted-foreground leading-relaxed">
            Kunci API (<code className="text-foreground bg-secondary px-1 rounded">OPENAI_API_KEY</code> & <code className="text-foreground bg-secondary px-1 rounded">GEMINI_API_KEY</code>) dikelola secara eksklusif di server dan tidak pernah diekspos ke browser untuk melindungi keamanan kredensial Anda.
          </p>
        </div>
      </div>

      {/* Provider Health Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> Supported AI Providers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const isConnected = p.status === "Connected";
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border p-5 space-y-4 transition-all relative overflow-hidden bg-card",
                  p.active ? "border-primary/50 shadow-md shadow-primary/5" : "border-border"
                )}
              >
                {p.active && (
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg border-b border-l border-primary/20">
                    Active
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {p.id === "mock" ? (
                      <Cpu className="h-5 w-5 text-amber-400" />
                    ) : p.id === "openai" ? (
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Bot className="h-5 w-5 text-blue-400" />
                    )}
                    <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Model: <span className="text-foreground font-mono">{p.model}</span></p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className={cn(
                      "font-semibold text-[10px] px-2 py-0.5 rounded-full",
                      p.type === "AI ESTIMATED"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    )}>
                      {p.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="flex items-center gap-1 font-medium">
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Not Configured</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" /> Panduan Konfigurasi Real AI (.env)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Untuk mengaktifkan Real AI (OpenAI atau Gemini), cukup tambahkan API key pada file <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">.env</code> di root project:
        </p>

        <div className="rounded-lg bg-black/60 p-4 font-mono text-xs text-emerald-400 space-y-2 overflow-x-auto border border-border">
          <p className="text-muted-foreground"># Opsi 1: Google Gemini (Disarankan: Kecepatan tinggi & hemat biaya)</p>
          <p>GEMINI_API_KEY="AIzaSy..."</p>
          <p>GEMINI_MODEL="gemini-2.0-flash"</p>
          <br />
          <p className="text-muted-foreground"># Opsi 2: OpenAI</p>
          <p>OPENAI_API_KEY="sk-proj-..."</p>
          <p>OPENAI_MODEL="gpt-4o"</p>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Setelah menyimpan file <code className="bg-secondary px-1 rounded text-foreground font-mono">.env</code>, klik tombol <strong>Check Health</strong> di atas untuk memverifikasi koneksi. Jika kedua key kosong, aplikasi akan otomatis menjalankan <strong>MockAIProvider (AI ESTIMATED)</strong> dengan data realistis.
        </p>
      </div>

      {/* Social Publishing & Metricool Integration Section */}
      <MetricoolSettingsSection />
    </div>
  );
}

function MetricoolSettingsSection() {
  const [status, setStatus] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchMetricool = () => {
    setLoading(true);
    fetch("/api/integrations/metricool/brands")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status);
        setBrands(data.brands || []);
        if (data.status?.brandId) setSelectedBrand(data.status.brandId);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetricool();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/integrations/metricool/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand,
          userToken: tokenInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        setBrands(data.brands || []);
        setSaveMessage("Pengaturan Metricool berhasil disimpan.");
        setTokenInput("");
        setShowConfigForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isConnected = status?.statusLabel === "CONNECTED";
  const isError = status?.statusLabel === "ERROR";

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/10 text-rose-400">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
              Social Publishing & Analytics Integration
            </span>
          </div>
          <h2 className="text-base font-bold text-foreground">TikTok / Metricool Operating Loop</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Integrasi langsung dengan akun TikTok resmi CommerceAI: <strong className="text-foreground">@onesecond.id3</strong>
          </p>
        </div>

        <button
          onClick={fetchMetricool}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh Connection
        </button>
      </div>

      {/* Account Info Card */}
      <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground block">Connected Target Account</span>
            <strong className="text-sm font-bold text-foreground">TikTok @onesecond.id3</strong>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground block">Role & Scope</span>
            <strong className="text-sm font-bold text-primary">ANALYTICS + PUBLISH</strong>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground block">Connection Status</span>
            <span className="flex items-center gap-1.5 mt-0.5">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">CONNECTED</span>
                </>
              ) : isError ? (
                <>
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold text-rose-400">ERROR</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">MOCK ESTIMATED</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Error notification if any */}
        {status?.error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <strong>Peringatan Koneksi: </strong>{status.error}
          </div>
        )}

        {saveMessage && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium">
            {saveMessage}
          </div>
        )}

        {/* Brand Selector */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">
              Pilih Target Brand Metricool:
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full sm:w-80 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.tiktokAccount?.username || "TikTok"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {showConfigForm ? "Sembunyikan Kredensial" : "Konfigurasi Token Metricool"}
          </button>
        </div>

        {/* Config Form Modal/Collapsible */}
        {showConfigForm && (
          <form onSubmit={handleSaveConfig} className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 pt-3">
            <h4 className="text-xs font-semibold text-foreground">Update Kredensial Metricool Server</h4>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Metricool User API Token (X-Mc-Auth)</label>
                <input
                  type="password"
                  placeholder="Masukkan token Metricool Anda..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan & Hubungkan"}
            </button>
          </form>
        )}
      </div>

      {/* Guide Note */}
      <div className="text-[11px] text-muted-foreground space-y-1">
        <p>
          💡 <strong>Prinsip Operasional:</strong> Akun TikTok <strong>onesecond.id3</strong> adalah satu-satunya akun penerbitan dan sumber analitik di CommerceAI. Semua analitik views, watch rate, dan engagement ditarik dari Metricool untuk akun ini tanpa perantara kedua.
        </p>
      </div>
    </div>
  );
}

