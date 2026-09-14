import { NextResponse } from "next/server";
import { syncTikTokData } from "@/lib/integrations/metricool/sync";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const brandId = body.brandId || undefined;

    const result = await syncTikTokData(brandId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("TikTok sync API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal sinkronisasi data TikTok",
    }, { status: 500 });
  }
}
