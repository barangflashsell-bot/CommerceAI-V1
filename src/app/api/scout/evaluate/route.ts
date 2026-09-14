import { NextResponse } from "next/server";
import { evaluateProductScout } from "@/lib/ai/engine/scout-score";
import type { ProductScoutInput } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const input: ProductScoutInput = {
      name: body.name || "",
      category: body.category || "General",
      price: Number(body.price) || 0,
      commissionRate: Number(body.commissionRate) || 0,
      description: body.description || "",
      targetBuyer: body.targetBuyer || "",
      productUrl: body.productUrl || "",
      imageUrl: body.imageUrl || undefined,
    };

    if (!input.name) {
      return NextResponse.json({ error: "Nama produk harus diisi" }, { status: 400 });
    }

    const result = evaluateProductScout(input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scout evaluate error:", error);
    return NextResponse.json({ error: "Gagal mengevaluasi produk" }, { status: 500 });
  }
}
