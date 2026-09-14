import { prisma } from "../src/lib/prisma.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_PATH = path.resolve(__dirname, "../prisma/sqlite_backup.json");

async function exportSqliteData() {
  console.log("==================================================");
  console.log("COMMERCEAI: EXPORTING SQLITE DATABASE SNAPSHOT");
  console.log("==================================================");

  try {
    // 1. Fetch all records from all 11 models in SQLite
    console.log("Reading all models from SQLite database (prisma/dev.db)...");

    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const contentProjects = await prisma.contentProject.findMany();
    const contentVariations = await prisma.contentVariation.findMany();
    const scoutAnalyses = await prisma.scoutAnalysis.findMany();
    const testingPlans = await prisma.testingPlan.findMany();
    const experiments = await prisma.experiment.findMany();
    const performanceMetrics = await prisma.performanceMetric.findMany();
    const aiInsights = await prisma.aiInsight.findMany();
    const settings = await prisma.setting.findMany();
    const aiLogs = await prisma.aiLog.findMany();

    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      source: "sqlite://prisma/dev.db",
      counts: {
        users: users.length,
        products: products.length,
        contentProjects: contentProjects.length,
        contentVariations: contentVariations.length,
        scoutAnalyses: scoutAnalyses.length,
        testingPlans: testingPlans.length,
        experiments: experiments.length,
        performanceMetrics: performanceMetrics.length,
        aiInsights: aiInsights.length,
        settings: settings.length,
        aiLogs: aiLogs.length,
      },
      data: {
        users,
        products,
        contentProjects,
        contentVariations,
        scoutAnalyses,
        testingPlans,
        experiments,
        performanceMetrics,
        aiInsights,
        settings,
        aiLogs,
      },
    };

    // 2. Write to prisma/sqlite_backup.json
    await fs.writeFile(BACKUP_PATH, JSON.stringify(snapshot, null, 2), "utf-8");

    console.log(`[PASS] Full SQLite Snapshot saved to: ${BACKUP_PATH}`);
    console.log("Record summary:");
    for (const [table, count] of Object.entries(snapshot.counts)) {
      console.log(` - ${table}: ${count} record(s)`);
    }

    console.log("==================================================");
    console.log("EXPORT SUCCESSFUL: SQLITE DATA FULLY PRESERVED");
    console.log("==================================================");
  } catch (error) {
    console.error("FATAL: Failed to export SQLite data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportSqliteData();
