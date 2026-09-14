"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AIStatusBadge } from "@/components/shared/ai-status-badge";
import {
  Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp,
  Video, Clock, Palette, Target, Lightbulb, Layers, Film, Code,
  Star, Calendar, Send, ExternalLink, AlertCircle, Play, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/db";
import type { ContentGenerationResult, StoryboardResult, VideoPromptResult, ConceptItem } from "@/lib/ai/types";
import type { BestTimeSlot } from "@/lib/integrations/metricool/types";

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts"];
const DURATIONS = ["10", "15", "30"];
const STYLES = ["Problem Solution", "Product Review", "UGC", "Unboxing", "Demonstration", "Before After", "Cinematic", "Minimalist"];
const OBJECTIVES = ["Click", "Awareness", "Add to Cart", "Conversion"];

function ContentLabInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProduct = searchParams.get("product");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [duration, setDuration] = useState("10");
  const [style, setStyle] = useState("Problem Solution");
  const [objective, setObjective] = useState("Click");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ContentGenerationResult | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<StoryboardResult | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<VideoPromptResult | null>(null);
  const [genStoryboard, setGenStoryboard] = useState(false);
  const [genVideoPrompt, setGenVideoPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"hooks" | "angles" | "concepts" | "storyboard" | "prompt">("hooks");
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);

  // Scheduling Workflow States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [bestTimes, setBestTimes] = useState<BestTimeSlot[]>([]);
  const [loadingBestTimes, setLoadingBestTimes] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    caption: "",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    scheduledAt: "",
    angle: "",
    hook: "",
    privacyLevel: "PUBLIC_TO_EVERYONE",
    allowComment: true,
    allowDuet: true,
    allowStitch: true,
    isAIGenerated: true,
  });

  const fetchProducts = useCallback(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => {
      setProducts(data);
      if (preselectedProduct) setSelectedProduct(preselectedProduct);
    });
  }, [preselectedProduct]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Load best times when modal opens
  const openScheduleModal = async (initialHook?: string, initialAngle?: string) => {
    const activeProd = products.find((p) => p.id === selectedProduct);
    const prodName = activeProd ? activeProd.name : "Produk Viral";
    const bestConceptObj = result?.concepts?.[selectedConcept] || result?.concepts?.[0];

    const chosenHook = initialHook || bestConceptObj?.hook || result?.hooks?.[0]?.text || "Rahasia produk yang lagi viral ini!";
    const chosenAngle = initialAngle || bestConceptObj?.angle || result?.angles?.[0]?.name || "Problem Solution";

    const defaultCaption = `${chosenHook}\n\nSolusi terbaik buat kamu yang butuh ${chosenAngle.toLowerCase()} untuk ${prodName}. Cek keranjang kuning sekarang mumpung lagi diskon flash sale! 🔥📦\n\n#affiliatetiktok #racuntiktok #tiktokshop #onesecond #fyp #rekomendasiproduk`;

    // Default scheduled time: tomorrow at 19:30
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 30, 0, 0);
    const defaultTimeStr = tomorrow.toISOString().slice(0, 16);

    setScheduleForm({
      caption: defaultCaption,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      scheduledAt: defaultTimeStr,
      angle: chosenAngle,
      hook: chosenHook,
      privacyLevel: "PUBLIC_TO_EVERYONE",
      allowComment: true,
      allowDuet: true,
      allowStitch: true,
      isAIGenerated: true,
    });

    setScheduleSuccess(null);
    setScheduleError(null);
    setIsScheduleModalOpen(true);

    // Fetch Best Time from Metricool API
    setLoadingBestTimes(true);
    try {
      const res = await fetch("/api/integrations/metricool/best-time");
      if (res.ok) {
        const data = await res.json();
        setBestTimes(data.bestTimes || []);
      }
    } catch (err) {
      console.error("Failed to load best times:", err);
    } finally {
      setLoadingBestTimes(false);
    }
  };

  const handleSelectBestTime = (slot: BestTimeSlot) => {
    // Determine target date from dayOfWeek
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilTarget = (slot.dayOfWeek - currentDay + 7) % 7 || 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(slot.hour, 0, 0, 0);
    setScheduleForm((prev) => ({
      ...prev,
      scheduledAt: targetDate.toISOString().slice(0, 16),
    }));
  };

  const handleScheduleSubmit = async () => {
    if (!selectedProduct) {
      setScheduleError("Pilih produk terlebih dahulu.");
      return;
    }
    if (!scheduleForm.caption) {
      setScheduleError("Caption tidak boleh kosong.");
      return;
    }
    if (!scheduleForm.scheduledAt) {
      setScheduleError("Pilih waktu penayangan (schedule date/time).");
      return;
    }

    setScheduling(true);
    setScheduleError(null);
    try {
      const res = await fetch("/api/integrations/metricool/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          contentProjectId: projectId || undefined,
          caption: scheduleForm.caption,
          scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
          videoUrl: scheduleForm.videoUrl,
          angle: scheduleForm.angle,
          hook: scheduleForm.hook,
          tiktokOptions: {
            privacyLevel: scheduleForm.privacyLevel,
            allowComment: scheduleForm.allowComment,
            allowDuet: scheduleForm.allowDuet,
            allowStitch: scheduleForm.allowStitch,
            isAIGenerated: scheduleForm.isAIGenerated,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menjadwalkan konten ke Metricool.");
      }

      setScheduleSuccess(`Konten berhasil dijadwalkan ke TikTok @onesecond.id3 via Metricool! (Post ID: ${data.post?.id || "scheduled"})`);
    } catch (err: unknown) {
      setScheduleError(err instanceof Error ? err.message : "Terjadi kesalahan saat menjadwalkan");
    } finally {
      setScheduling(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setGenerating(true);
    setResult(null);
    setStoryboard(null);
    setVideoPrompt(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct, platform, duration, style, objective }),
      });
      const data = await res.json();
      setResult(data.result);
      setProjectId(data.project.id);
      setSelectedConcept(data.result.bestConcept.index);
      setActiveTab("hooks");
    } catch (error) { console.error(error); }
    finally { setGenerating(false); }
  };

  const handleGenerateStoryboard = async () => {
    if (!projectId) return;
    setGenStoryboard(true);
    try {
      const res = await fetch("/api/content/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, conceptIndex: selectedConcept }),
      });
      const data = await res.json();
      setStoryboard(data);
      setActiveTab("storyboard");
    } catch (error) { console.error(error); }
    finally { setGenStoryboard(false); }
  };

  const handleGenerateVideoPrompt = async () => {
    if (!projectId) return;
    setGenVideoPrompt(true);
    try {
      const res = await fetch("/api/content/video-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      setVideoPrompt(data);
      setActiveTab("prompt");
    } catch (error) { console.error(error); }
    finally { setGenVideoPrompt(false); }
  };

  const handleCopyJSON = () => {
    if (!videoPrompt) return;
    navigator.clipboard.writeText(JSON.stringify(videoPrompt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: "hooks", label: "Hooks", icon: Lightbulb, count: result?.hooks?.length },
    { key: "angles", label: "Angles", icon: Target, count: result?.angles?.length },
    { key: "concepts", label: "Concepts", icon: Layers, count: result?.concepts?.length },
    ...(storyboard ? [{ key: "storyboard", label: "Storyboard", icon: Film }] : []),
    ...(videoPrompt ? [{ key: "prompt", label: "Video Prompt", icon: Code }] : []),
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Lab</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate strategi konten, hooks, storyboard, dan video prompt</p>
        </div>
        <AIStatusBadge />
      </div>

      {/* Configuration */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Konfigurasi Konten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Video className="inline h-3 w-3 mr-1" />Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Clock className="inline h-3 w-3 mr-1" />Durasi</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {DURATIONS.map((d) => <option key={d} value={d}>{d} detik</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Palette className="inline h-3 w-3 mr-1" />Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Target className="inline h-3 w-3 mr-1" />Objective</label>
            <select value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedProduct || generating}
          className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Content Strategy</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Tabs and Top Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg bg-secondary/50 p-1 overflow-x-auto w-full sm:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all whitespace-nowrap",
                    activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {"count" in tab && tab.count && (
                    <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => openScheduleModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Calendar className="h-4 w-4" />
              Jadwalkan ke TikTok (@onesecond.id3)
            </button>
          </div>

          {/* Hooks Tab */}
          {activeTab === "hooks" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">10 Hooks</h3>
                <span className="text-xs text-muted-foreground">Pilih hook untuk dijadwalkan langsung</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.hooks.map((hook) => (
                  <div key={hook.id} className="rounded-lg bg-secondary/50 p-4 hover:bg-secondary/80 transition-colors flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium mb-2">&ldquo;{hook.text}&rdquo;</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">{hook.type}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                          hook.strength === "Tinggi" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        )}>{hook.strength}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openScheduleModal(hook.text, result.angles[0]?.name)}
                      className="self-end inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium pt-1"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Jadwalkan Hook Ini
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Angles Tab */}
          {activeTab === "angles" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">5 Content Angles</h3>
              <div className="space-y-3">
                {result.angles.map((angle) => (
                  <div key={angle.id} className="flex items-center justify-between gap-4 rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                        <span className={cn("text-lg font-bold", angle.score >= 80 ? "text-emerald-400" : angle.score >= 60 ? "text-blue-400" : "text-amber-400")}>
                          {angle.score}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{angle.name}</p>
                        <p className="text-xs text-muted-foreground">{angle.description}</p>
                        <p className="text-xs text-primary/80 mt-1">Target emosi: {angle.targetEmotion}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openScheduleModal(result.hooks[0]?.text, angle.name)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      Pilih Angle Ini
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts Tab */}
          {activeTab === "concepts" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">5 Video Concepts</h3>
              <div className="space-y-3">
                {result.concepts.map((concept: ConceptItem, idx: number) => (
                  <div
                    key={concept.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all cursor-pointer",
                      idx === result.bestConcept.index
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-secondary/30 hover:bg-secondary/50",
                      selectedConcept === idx && "ring-2 ring-primary/50"
                    )}
                    onClick={() => { setSelectedConcept(idx); setExpandedConcept(expandedConcept === idx ? null : idx); }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {idx === result.bestConcept.index && (
                          <Star className="h-4 w-4 text-primary fill-primary" />
                        )}
                        <h4 className="text-sm font-semibold text-foreground">{concept.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openScheduleModal(concept.hook, concept.angle);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2 py-1 text-[11px] font-medium transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          Jadwalkan
                        </button>
                        {expandedConcept === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{concept.description}</p>
                    {expandedConcept === idx && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        <p className="text-xs"><span className="font-medium text-foreground">Hook:</span> <span className="text-muted-foreground">{concept.hook}</span></p>
                        <p className="text-xs"><span className="font-medium text-foreground">Angle:</span> <span className="text-muted-foreground">{concept.angle}</span></p>
                        <p className="text-xs"><span className="font-medium text-foreground">Flow:</span> <span className="text-muted-foreground">{concept.flow}</span></p>
                        <p className="text-xs"><span className="font-medium text-foreground">Expected Impact:</span> <span className="text-muted-foreground">{concept.expectedImpact}</span></p>
                      </div>
                    )}
                    {idx === result.bestConcept.index && (
                      <div className="mt-3 rounded-md bg-primary/10 p-2.5 border border-primary/20">
                        <p className="text-xs text-primary">⭐ Best Concept: {result.bestConcept.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleGenerateStoryboard}
                  disabled={genStoryboard}
                  className="inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {genStoryboard ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Storyboard...</> : <><Film className="h-4 w-4" /> Generate Storyboard</>}
                </button>
                <button
                  onClick={() => openScheduleModal()}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Jadwalkan Best Concept ke TikTok
                </button>
              </div>
            </div>
          )}

          {/* Storyboard Tab */}
          {activeTab === "storyboard" && storyboard && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">Storyboard — {storyboard.totalDuration}</h3>
                <button
                  onClick={() => openScheduleModal()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Jadwalkan Storyboard Ini
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {storyboard.scenes.map((scene) => (
                    <div key={scene.sceneNumber} className="relative pl-12">
                      <div className="absolute left-3 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {scene.sceneNumber}
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{scene.timeRange}</span>
                          <span className="text-[10px] text-muted-foreground">{scene.purpose}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div><p className="font-medium text-foreground mb-1">Visual</p><p className="text-muted-foreground">{scene.visual}</p></div>
                          <div><p className="font-medium text-foreground mb-1">Camera</p><p className="text-muted-foreground">{scene.camera}</p></div>
                          <div><p className="font-medium text-foreground mb-1">Action</p><p className="text-muted-foreground">{scene.action}</p></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Consistency Rules */}
              <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <h4 className="text-xs font-semibold text-foreground mb-2">Product Consistency Rules</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {storyboard.productConsistencyRules.map((rule, i) => (
                    <span key={i} className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> {rule}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateVideoPrompt}
                disabled={genVideoPrompt}
                className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {genVideoPrompt ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Prompt...</> : <><Code className="h-4 w-4" /> Generate Video Prompt JSON</>}
              </button>
            </div>
          )}

          {/* Video Prompt Tab */}
          {activeTab === "prompt" && videoPrompt && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">Video Prompt JSON</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openScheduleModal()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Jadwalkan ke TikTok
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy JSON</>}
                  </button>
                </div>
              </div>
              <pre className="rounded-lg bg-background border border-border p-4 overflow-x-auto text-xs text-muted-foreground leading-relaxed font-mono">
                {JSON.stringify(videoPrompt, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE TO TIKTOK MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00f2fe] via-[#4facfe] to-[#fe0979] text-white shadow-md">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Jadwalkan Post ke TikTok via Metricool</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    Target: <span className="font-semibold text-foreground">@onesecond.id3</span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] text-emerald-400 font-medium">ANALYTICS + PUBLISH</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
              {/* Form Column (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Angle & Hook Info */}
                <div className="rounded-lg bg-secondary/40 border border-border/50 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Angle:</span>
                    <span className="font-semibold text-primary">{scheduleForm.angle || "Problem Solution"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground font-medium shrink-0">Hook:</span>
                    <span className="text-right text-foreground font-medium line-clamp-1">{scheduleForm.hook || "Video hook viral"}</span>
                  </div>
                </div>

                {/* Caption Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">Caption & Copywriting</label>
                    <span className="text-[11px] text-muted-foreground">{scheduleForm.caption.length} / 2200 karakter</span>
                  </div>
                  <textarea
                    rows={4}
                    value={scheduleForm.caption}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, caption: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans"
                    placeholder="Tulis caption menarik dan ajakan checkout keranjang kuning..."
                  />
                  {/* Quick Hashtags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["#affiliatetiktok", "#racuntiktok", "#tiktokshop", "#onesecond", "#fyp", "#rekomendasi"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!scheduleForm.caption.includes(tag)) {
                            setScheduleForm({ ...scheduleForm, caption: `${scheduleForm.caption} ${tag}` });
                          }
                        }}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Video Asset URL (Cloudinary / MP4)</label>
                  <input
                    type="url"
                    value={scheduleForm.videoUrl}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, videoUrl: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    placeholder="https://..."
                  />
                </div>

                {/* Best Time to Post Recommendation */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Metricool Best Time to Post (@onesecond.id3)
                    </div>
                    {loadingBestTimes && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Jadwal penayangan dengan konsentrasi audiens dan potensi engagement tertinggi di TikTok akunmu:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {bestTimes.length > 0 ? (
                      bestTimes.slice(0, 4).map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectBestTime(slot)}
                          className="flex flex-col items-start rounded-lg border border-border bg-card p-2 text-left hover:border-primary/50 hover:bg-primary/5 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-foreground">{slot.dayName} {slot.hour}:00</span>
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] text-emerald-400 font-bold">Skor {slot.score}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{slot.peakAudience} audiens</span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-xs text-muted-foreground italic py-1">
                        Memuat rekomendasi waktu tayang dari Metricool...
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule DateTime Picker */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Waktu Penayangan Terjadwal</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* TikTok Options */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Privacy Level</label>
                    <select
                      value={scheduleForm.privacyLevel}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, privacyLevel: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="PUBLIC_TO_EVERYONE">Public to Everyone</option>
                      <option value="MUTUAL_FOLLOW_FRIENDS">Friends Only</option>
                      <option value="SELF_ONLY">Private (Self Only)</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleForm.isAIGenerated}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, isAIGenerated: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary/50"
                      />
                      <span>Label AI Disclosure (TikTok requirement)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleForm.allowComment}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, allowComment: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary/50"
                      />
                      <span>Buka Komentar & Duet</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* TikTok Live Preview Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 text-pink-500" />
                  Live Preview TikTok (@onesecond.id3)
                </div>

                {/* Phone Mockup Frame */}
                <div className="relative w-64 h-[440px] rounded-3xl bg-neutral-950 border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between p-3 text-white">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 px-1">
                    <span>LIVE</span>
                    <span className="font-semibold text-white">Untuk Anda</span>
                    <span>🔍</span>
                  </div>

                  {/* Center Video Graphic Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-black -z-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md mb-2 border border-white/20">
                        <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                      </div>
                      <p className="text-[10px] text-neutral-400">10s AI Affiliate Video</p>
                      <p className="text-[9px] text-neutral-500 line-clamp-1">{scheduleForm.angle || "Problem Solution"}</p>
                    </div>
                  </div>

                  {/* Right Side TikTok Icons */}
                  <div className="absolute right-2 bottom-16 z-10 flex flex-col items-center gap-3 text-white">
                    <div className="relative flex flex-col items-center">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold ring-2 ring-white">
                        1S
                      </div>
                      <span className="absolute -bottom-1 text-[8px] bg-red-500 rounded-full px-1 font-bold">+</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px]">
                      <span className="text-red-500">❤️</span>
                      <span className="text-[9px] text-neutral-300">14.2K</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px]">
                      <span>💬</span>
                      <span className="text-[9px] text-neutral-300">238</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px]">
                      <span>⭐</span>
                      <span className="text-[9px] text-neutral-300">1.8K</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px]">
                      <span>↗️</span>
                      <span className="text-[9px] text-neutral-300">420</span>
                    </div>
                  </div>

                  {/* Bottom Video Information & Caption */}
                  <div className="relative z-10 space-y-1.5 pr-10">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">@onesecond.id3</span>
                      <span className="rounded-full bg-emerald-500 h-2 w-2" />
                    </div>
                    <p className="text-[11px] leading-tight text-neutral-200 line-clamp-3">
                      {scheduleForm.caption || "Caption preview TikTok..."}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded w-fit">
                      <span>🛒 Keranjang Kuning Tersemat</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-neutral-400">
                      <span>🎵 suara asli - onesecond.id3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error / Success Notifications */}
            {scheduleError && (
              <div className="mx-6 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}
            {scheduleSuccess && (
              <div className="mx-6 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between text-xs text-emerald-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
                <button
                  onClick={() => router.push("/publishing")}
                  className="rounded bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  Buka Dashboard Publishing
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-secondary/20">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Data akan tersinkronisasi otomatis dengan Metricool API.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleScheduleSubmit}
                  disabled={scheduling}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {scheduling ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menjadwalkan...</>
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Konfirmasi & Jadwalkan Post</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ContentLabInner />
    </Suspense>
  );
}
