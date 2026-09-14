import { NextResponse } from "next/server";
import { metricoolClient } from "@/lib/integrations/metricool/client";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productId,
      contentProjectId,
      name,
      hook,
      angle,
      videoUrl,
      dateTime,
      caption,
      hashtags,
      privacy,
      aiGeneratedContent,
      brandId,
    } = body;

    // 1. Validations
    if (!productId) {
      return NextResponse.json({ error: "Product ID diperlukan" }, { status: 400 });
    }
    if (!videoUrl || String(videoUrl).trim().length === 0) {
      return NextResponse.json({ error: "URL video wajib diisi untuk menjadwalkan konten TikTok" }, { status: 400 });
    }
    if (!dateTime) {
      return NextResponse.json({ error: "Waktu publikasi wajib dipilih" }, { status: 400 });
    }

    const scheduledDate = new Date(dateTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return NextResponse.json({
        error: "Waktu penjadwalan harus di masa depan (minimal 5 menit dari sekarang)",
      }, { status: 400 });
    }

    const fullText = `${caption || ""} ${hashtags || ""}`.trim();

    // 2. Schedule via Metricool Client
    const scheduleResult = await metricoolClient.createScheduledPost({
      brandId,
      targetAccount: "onesecond.id3",
      text: fullText,
      videoUrl,
      dateTime,
      privacy: privacy || "PUBLIC_TO_EVERYONE",
      aiGeneratedContent: Boolean(aiGeneratedContent),
      title: name || hook || "TikTok Content",
    });

    if (!scheduleResult.success) {
      return NextResponse.json({
        error: scheduleResult.error || "Gagal menjadwalkan ke Metricool",
      }, { status: 500 });
    }

    // 3. Create or update Experiment in SQLite
    const experiment = await db.experiments.create({
      name: name || `Exp - ${hook.slice(0, 30)}`,
      productId,
      contentProjectId: contentProjectId || undefined,
      externalPostId: scheduleResult.externalPostId,
      hook: hook || "Default Hook",
      angle: angle || "Problem Solution",
      platform: "TikTok",
      duration: "15s",
      objective: "Conversion",
      status: "SCHEDULED",
      scheduledAt: dateTime,
      videoUrl,
      caption,
      hashtags,
      privacy: privacy || "PUBLIC_TO_EVERYONE",
      aiGeneratedContent: Boolean(aiGeneratedContent),
    });

    return NextResponse.json({
      success: true,
      experiment,
      scheduleResult,
      targetAccount: "onesecond.id3",
      scheduledAt: dateTime,
    });
  } catch (error: any) {
    console.error("Schedule error:", error);
    return NextResponse.json({
      error: error.message || "Gagal memproses penjadwalan",
    }, { status: 500 });
  }
}
