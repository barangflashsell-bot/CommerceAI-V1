import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const portfolio = await db.scout.getPortfolio();
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Portfolio error:", error);
    return NextResponse.json({ error: "Gagal memuat portfolio produk" }, { status: 500 });
  }
}
