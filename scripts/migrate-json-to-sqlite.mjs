import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

async function migrate() {
  console.log("=== STARTING JSON TO SQLITE MIGRATION ===");

  // 1. MIGRATE PRODUCTS
  const productsPath = path.join(DATA_DIR, "products.json");
  let jsonProducts = [];
  if (fs.existsSync(productsPath)) {
    jsonProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  }
  console.log(`Found ${jsonProducts.length} products in JSON.`);

  for (const p of jsonProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        link: p.link || "",
        category: p.category,
        price: Number(p.price) || 0,
        commissionRate: Number(p.commissionRate) || 0,
        imageUrl: p.imageUrl || null,
        targetAudience: p.targetAudience || "",
        description: p.description || "",
        advantages: p.advantages || "",
        problemSolved: p.problemSolved || "",
        opportunityScore: p.opportunityScore !== undefined ? Number(p.opportunityScore) : null,
        aiAnalysis: p.aiAnalysis ? JSON.stringify(p.aiAnalysis) : null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
      create: {
        id: p.id,
        name: p.name,
        link: p.link || "",
        category: p.category,
        price: Number(p.price) || 0,
        commissionRate: Number(p.commissionRate) || 0,
        imageUrl: p.imageUrl || null,
        targetAudience: p.targetAudience || "",
        description: p.description || "",
        advantages: p.advantages || "",
        problemSolved: p.problemSolved || "",
        opportunityScore: p.opportunityScore !== undefined ? Number(p.opportunityScore) : null,
        aiAnalysis: p.aiAnalysis ? JSON.stringify(p.aiAnalysis) : null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });
  }

  // 2. MIGRATE CONTENT PROJECTS
  const contentPath = path.join(DATA_DIR, "content_projects.json");
  let jsonContent = [];
  if (fs.existsSync(contentPath)) {
    jsonContent = JSON.parse(fs.readFileSync(contentPath, "utf-8"));
  }
  console.log(`Found ${jsonContent.length} content projects in JSON.`);

  for (const c of jsonContent) {
    // Check if productId exists in database first
    const prodExists = await prisma.product.findUnique({ where: { id: c.productId } });
    if (!prodExists) {
      console.warn(`Skipping content project ${c.id}: productId ${c.productId} does not exist in SQLite.`);
      continue;
    }

    await prisma.contentProject.upsert({
      where: { id: c.id },
      update: {
        productId: c.productId,
        platform: c.platform || "TikTok",
        duration: c.duration || "10",
        style: c.style || "Problem-Solution",
        objective: c.objective || "Affiliate Conversion",
        targetAudience: c.targetAudience || "",
        hooks: c.hooks ? JSON.stringify(c.hooks) : null,
        angles: c.angles ? JSON.stringify(c.angles) : null,
        concepts: c.concepts ? JSON.stringify(c.concepts) : null,
        bestConcept: c.bestConcept ? JSON.stringify(c.bestConcept) : null,
        storyboard: c.storyboard ? JSON.stringify(c.storyboard) : null,
        videoPrompt: c.videoPrompt ? JSON.stringify(c.videoPrompt) : null,
        status: c.status || "draft",
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
      create: {
        id: c.id,
        productId: c.productId,
        platform: c.platform || "TikTok",
        duration: c.duration || "10",
        style: c.style || "Problem-Solution",
        objective: c.objective || "Affiliate Conversion",
        targetAudience: c.targetAudience || "",
        hooks: c.hooks ? JSON.stringify(c.hooks) : null,
        angles: c.angles ? JSON.stringify(c.angles) : null,
        concepts: c.concepts ? JSON.stringify(c.concepts) : null,
        bestConcept: c.bestConcept ? JSON.stringify(c.bestConcept) : null,
        storyboard: c.storyboard ? JSON.stringify(c.storyboard) : null,
        videoPrompt: c.videoPrompt ? JSON.stringify(c.videoPrompt) : null,
        status: c.status || "draft",
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
    });
  }

  // 3. MIGRATE PERFORMANCE METRICS
  const perfPath = path.join(DATA_DIR, "performance_metrics.json");
  let jsonPerf = [];
  if (fs.existsSync(perfPath)) {
    jsonPerf = JSON.parse(fs.readFileSync(perfPath, "utf-8"));
  }
  console.log(`Found ${jsonPerf.length} performance metrics in JSON.`);

  for (const m of jsonPerf) {
    const prodExists = await prisma.product.findUnique({ where: { id: m.productId } });
    if (!prodExists) {
      console.warn(`Skipping performance metric ${m.id}: productId ${m.productId} does not exist in SQLite.`);
      continue;
    }

    await prisma.performanceMetric.upsert({
      where: { id: m.id },
      update: {
        productId: m.productId,
        contentVariationId: m.contentVariationId || null,
        contentId: m.contentId || null,
        date: m.date ? new Date(m.date) : new Date(),
        platform: m.platform || "TikTok",
        views: Number(m.views) || 0,
        likes: Number(m.likes) || 0,
        comments: Number(m.comments) || 0,
        shares: Number(m.shares) || 0,
        clicks: Number(m.clicks) || 0,
        addToCart: Number(m.addToCart) || 0,
        orders: Number(m.orders) || 0,
        commission: Number(m.commission) || 0,
        videoConcept: m.videoConcept || null,
        hook: m.hook || null,
        angle: m.angle || null,
        ctr: m.ctr !== undefined ? Number(m.ctr) : null,
        cvr: m.cvr !== undefined ? Number(m.cvr) : null,
        revenue: m.revenue !== undefined ? Number(m.revenue) : null,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      },
      create: {
        id: m.id,
        productId: m.productId,
        contentVariationId: m.contentVariationId || null,
        contentId: m.contentId || null,
        date: m.date ? new Date(m.date) : new Date(),
        platform: m.platform || "TikTok",
        views: Number(m.views) || 0,
        likes: Number(m.likes) || 0,
        comments: Number(m.comments) || 0,
        shares: Number(m.shares) || 0,
        clicks: Number(m.clicks) || 0,
        addToCart: Number(m.addToCart) || 0,
        orders: Number(m.orders) || 0,
        commission: Number(m.commission) || 0,
        videoConcept: m.videoConcept || null,
        hook: m.hook || null,
        angle: m.angle || null,
        ctr: m.ctr !== undefined ? Number(m.ctr) : null,
        cvr: m.cvr !== undefined ? Number(m.cvr) : null,
        revenue: m.revenue !== undefined ? Number(m.revenue) : null,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      },
    });
  }

  // 4. VERIFY RECORD COUNTS
  const sqliteProducts = await prisma.product.count();
  const sqliteContent = await prisma.contentProject.count();
  const sqlitePerf = await prisma.performanceMetric.count();

  console.log("\n=== MIGRATION AUDIT & COMPARISON ===");
  console.log(`Products:            JSON = ${jsonProducts.length} | SQLite = ${sqliteProducts}`);
  console.log(`Content Projects:    JSON = ${jsonContent.length} | SQLite = ${sqliteContent}`);
  console.log(`Performance Metrics: JSON = ${jsonPerf.length} | SQLite = ${sqlitePerf}`);

  if (sqliteProducts !== jsonProducts.length) {
    throw new Error("Product count mismatch between JSON and SQLite!");
  }
  if (sqliteContent !== jsonContent.length) {
    throw new Error("Content count mismatch between JSON and SQLite!");
  }
  if (sqlitePerf !== jsonPerf.length) {
    throw new Error("Performance count mismatch between JSON and SQLite!");
  }

  console.log("SUCCESS: All records successfully migrated with 100% count match!\n");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
