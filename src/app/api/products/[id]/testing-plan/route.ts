import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await db.scout.getTestingPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Testing plan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Get testing plan error:", error);
    return NextResponse.json({ error: "Gagal memuat testing plan" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const customThreshold = {
      minimumCTR: Number(body.minimumCTR) || 0.02,
      minimumCVR: Number(body.minimumCVR) || 0.03,
      minimumRPM: Number(body.minimumRPM) || 15000,
    };

    await db.scout.updateTestingThreshold(id, customThreshold);
    const updatedPlan = await db.scout.getTestingPlan(id);

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Update testing plan threshold error:", error);
    return NextResponse.json({ error: "Gagal memperbarui threshold testing" }, { status: 500 });
  }
}
