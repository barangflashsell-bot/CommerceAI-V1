import { NextResponse } from "next/server";
import { metricoolClient } from "@/lib/integrations/metricool/client";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const status = await metricoolClient.checkConnection();
    const brands = await metricoolClient.getBrands();

    return NextResponse.json({
      status,
      brands,
      targetAccount: "onesecond.id3",
    });
  } catch (error: any) {
    console.error("Metricool brands error:", error);
    return NextResponse.json({
      error: error.message || "Gagal mengambil data akun Metricool",
      targetAccount: "onesecond.id3",
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.brandId) {
      await db.settings.set("METRICOOL_BRAND_ID", String(body.brandId));
    }
    if (body.userToken) {
      await db.settings.set("METRICOOL_USER_TOKEN", String(body.userToken));
    }
    if (body.userId) {
      await db.settings.set("METRICOOL_USER_ID", String(body.userId));
    }

    await metricoolClient.loadSettings();
    const status = await metricoolClient.checkConnection();
    const brands = await metricoolClient.getBrands();

    return NextResponse.json({
      success: true,
      status,
      brands,
    });
  } catch (error: any) {
    console.error("Save metricool settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan Metricool" }, { status: 500 });
  }
}
