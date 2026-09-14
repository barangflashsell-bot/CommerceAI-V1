import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const products = await db.products.findAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await db.products.create({
      id: uuidv4(),
      name: body.name,
      link: body.link,
      category: body.category,
      price: parseFloat(body.price),
      commissionRate: parseFloat(body.commissionRate),
      imageUrl: body.imageUrl || undefined,
      targetAudience: body.targetAudience,
      description: body.description,
      advantages: body.advantages,
      problemSolved: body.problemSolved,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
