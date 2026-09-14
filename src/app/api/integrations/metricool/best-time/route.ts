import { NextResponse } from "next/server";
import { metricoolClient } from "@/lib/integrations/metricool/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId") || undefined;
    const timezone = searchParams.get("timezone") || "Asia/Jakarta";

    const slots = await metricoolClient.getBestTimeToPost({ brandId, timezone });
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const enrichedSlots = slots.map((s) => ({
      ...s,
      dayName: dayNames[s.dayOfWeek % 7] || "Hari Ini",
      peakAudience: s.isPeak ? "Tinggi (Peak)" : "Sedang",
    }));

    return NextResponse.json({
      targetAccount: "onesecond.id3",
      slots: enrichedSlots,
      bestTimes: enrichedSlots,
      peakHour: enrichedSlots.find((s) => s.isPeak) || enrichedSlots[0],
      sourceNotice: metricoolClient.isConfigured() ? "METRICOOL REAL DATA" : "Using account-level estimate",
    });
  } catch (error: any) {
    console.error("Best time error:", error);
    return NextResponse.json({
      targetAccount: "onesecond.id3",
      slots: [],
      bestTimes: [],
      error: error.message,
    }, { status: 500 });
  }
}
