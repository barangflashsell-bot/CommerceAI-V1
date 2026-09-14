import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeExperiments } from "@/lib/integrations/metricool/analyzer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const productId = searchParams.get("productId") || undefined;

    const experiments = await db.experiments.findAll({ status, productId });
    const counts = await db.experiments.getCounts();
    const analysis = analyzeExperiments(experiments as any);

    return NextResponse.json({
      experiments,
      counts,
      stats: counts,
      comparisons: analysis.comparisons,
      analysis,
      targetAccount: "onesecond.id3",
    });
  } catch (error: any) {
    console.error("Get experiments error:", error);
    return NextResponse.json({ error: error.message || "Gagal memuat daftar eksperimen" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const experiments = await db.experiments.findAll({ status: "ALL" });
    const analysis = analyzeExperiments(experiments as any);

    return NextResponse.json({
      targetAccount: "onesecond.id3",
      analysis,
    });
  } catch (error: any) {
    console.error("Analyze experiments error:", error);
    return NextResponse.json({ error: error.message || "Gagal menganalisis eksperimen" }, { status: 500 });
  }
}
