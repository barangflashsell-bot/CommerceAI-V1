import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ProductScoutResult, ProductScoutInput } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productInput: ProductScoutInput = body.product;
    const scoutResult: ProductScoutResult = body.scoutResult;

    if (!productInput || !productInput.name) {
      return NextResponse.json({ error: "Data produk tidak lengkap" }, { status: 400 });
    }

    // 1. Create Product in SQLite
    const createdProduct = await db.products.create({
      name: productInput.name,
      link: productInput.productUrl || "#",
      category: productInput.category || "General",
      price: Number(productInput.price) || 0,
      commissionRate: Number(productInput.commissionRate) || 0,
      imageUrl: productInput.imageUrl || undefined,
      targetAudience: productInput.targetBuyer || "Affiliate Market",
      description: productInput.description || "",
      advantages: scoutResult ? scoutResult.bestAngles.join("; ") : "",
      problemSolved: productInput.description || "",
      opportunityScore: scoutResult ? scoutResult.score : 70,
      status: "DISCOVERED",
    });

    // 2. Save Scout Analysis
    if (scoutResult) {
      await db.scout.saveScoutAnalysis(createdProduct.id, scoutResult);
    }

    // 3. Save Testing Plan
    if (scoutResult && scoutResult.testingPlan) {
      await db.scout.saveTestingPlan(createdProduct.id, scoutResult.testingPlan);
    }

    const fullProduct = await db.products.findById(createdProduct.id);
    return NextResponse.json({ success: true, product: fullProduct });
  } catch (error) {
    console.error("Add to lab error:", error);
    return NextResponse.json({ error: "Gagal menambahkan produk ke Product Lab" }, { status: 500 });
  }
}
