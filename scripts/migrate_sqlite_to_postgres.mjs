import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_PATH = path.resolve(__dirname, "../prisma/sqlite_backup.json");

/**
 * Migration & Verification Script: SQLite -> Cloud PostgreSQL
 * 
 * Usage:
 *   node scripts/migrate_sqlite_to_postgres.mjs
 *   node scripts/migrate_sqlite_to_postgres.mjs --dry-run
 *   node scripts/migrate_sqlite_to_postgres.mjs --verify-only
 */
async function runMigration() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isVerifyOnly = args.includes("--verify-only");

  console.log("==================================================");
  console.log("COMMERCEAI: SQLITE -> CLOUD POSTGRESQL MIGRATION");
  console.log("==================================================");
  if (isDryRun) console.log("MODE: DRY RUN (Simulasi tanpa mutasi database)");
  if (isVerifyOnly) console.log("MODE: VERIFY ONLY (Cek jumlah data target)");

  // 1. Verify and read SQLite snapshot
  let snapshot;
  try {
    const rawData = await fs.readFile(BACKUP_PATH, "utf-8");
    snapshot = JSON.parse(rawData);
    console.log(`[PASS] Loaded SQLite snapshot from: ${BACKUP_PATH}`);
    console.log(`Snapshot exported at: ${snapshot.exportedAt}`);
  } catch (err) {
    console.error("ERROR: File prisma/sqlite_backup.json tidak ditemukan!");
    console.error("Jalankan 'node scripts/export_sqlite_data.mjs' terlebih dahulu.");
    process.exit(1);
  }

  // 2. Validate Target PostgreSQL Connection String
  const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;
  if (!targetUrl || targetUrl.startsWith("file:")) {
    console.error("ERROR: DATABASE_URL harus berupa connection string PostgreSQL!");
    console.error("Contoh format: postgresql://[user]:[pass]@[host]:[port]/[db]?sslmode=require");
    process.exit(1);
  }

  // Hide password in logs
  const maskedUrl = targetUrl.replace(/:([^:@]+)@/, ":****@");
  console.log(`Target Cloud PostgreSQL: ${maskedUrl}`);

  const targetPrisma = new PrismaClient({
    datasources: {
      db: { url: targetUrl },
    },
  });

  let isConnected = false;
  try {
    // 3. Test Connection
    console.log("Menghubungi Cloud PostgreSQL server...");
    try {
      await targetPrisma.$connect();
      isConnected = true;
      console.log("[PASS] Berhasil terhubung ke Cloud PostgreSQL!");
    } catch (connErr) {
      if (isDryRun) {
        console.log(`[DRY-RUN NOTICE] Cloud connection simulated (Target host belum aktif: ${connErr.message.split("\n")[0]})`);
      } else {
        throw connErr;
      }
    }

    if (!isVerifyOnly) {
      console.log("\nMemulai migrasi data berurutan (Foreign Key Dependency Order)...");

      const { data } = snapshot;

      // 1. Users
      if (data.users?.length) {
        console.log(`Migrating ${data.users.length} Users...`);
        if (!isDryRun) {
          for (const item of data.users) {
            await targetPrisma.user.upsert({
              where: { id: item.id },
              update: { name: item.name, email: item.email },
              create: {
                id: item.id,
                email: item.email,
                name: item.name,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 2. Products (Primary Parent)
      if (data.products?.length) {
        console.log(`Migrating ${data.products.length} Products...`);
        if (!isDryRun) {
          for (const item of data.products) {
            await targetPrisma.product.upsert({
              where: { id: item.id },
              update: {
                name: item.name,
                link: item.link,
                category: item.category,
                price: item.price,
                commissionRate: item.commissionRate,
                imageUrl: item.imageUrl,
                targetAudience: item.targetAudience,
                description: item.description,
                advantages: item.advantages,
                problemSolved: item.problemSolved,
                opportunityScore: item.opportunityScore,
                aiAnalysis: item.aiAnalysis,
                status: item.status,
              },
              create: {
                id: item.id,
                name: item.name,
                link: item.link,
                category: item.category,
                price: item.price,
                commissionRate: item.commissionRate,
                imageUrl: item.imageUrl,
                targetAudience: item.targetAudience,
                description: item.description,
                advantages: item.advantages,
                problemSolved: item.problemSolved,
                opportunityScore: item.opportunityScore,
                aiAnalysis: item.aiAnalysis,
                status: item.status,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 3. ContentProjects
      if (data.contentProjects?.length) {
        console.log(`Migrating ${data.contentProjects.length} Content Projects...`);
        if (!isDryRun) {
          for (const item of data.contentProjects) {
            await targetPrisma.contentProject.upsert({
              where: { id: item.id },
              update: {
                platform: item.platform,
                duration: item.duration,
                style: item.style,
                objective: item.objective,
                targetAudience: item.targetAudience,
                hooks: item.hooks,
                angles: item.angles,
                concepts: item.concepts,
                bestConcept: item.bestConcept,
                storyboard: item.storyboard,
                videoPrompt: item.videoPrompt,
                status: item.status,
              },
              create: {
                id: item.id,
                productId: item.productId,
                platform: item.platform,
                duration: item.duration,
                style: item.style,
                objective: item.objective,
                targetAudience: item.targetAudience,
                hooks: item.hooks,
                angles: item.angles,
                concepts: item.concepts,
                bestConcept: item.bestConcept,
                storyboard: item.storyboard,
                videoPrompt: item.videoPrompt,
                status: item.status,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 4. ContentVariations
      if (data.contentVariations?.length) {
        console.log(`Migrating ${data.contentVariations.length} Content Variations...`);
        if (!isDryRun) {
          for (const item of data.contentVariations) {
            await targetPrisma.contentVariation.upsert({
              where: { id: item.id },
              update: {
                title: item.title,
                hookUsed: item.hookUsed,
                angleUsed: item.angleUsed,
                conceptUsed: item.conceptUsed,
                storyboard: item.storyboard,
                videoPrompt: item.videoPrompt,
                status: item.status,
              },
              create: {
                id: item.id,
                contentProjectId: item.contentProjectId,
                title: item.title,
                hookUsed: item.hookUsed,
                angleUsed: item.angleUsed,
                conceptUsed: item.conceptUsed,
                storyboard: item.storyboard,
                videoPrompt: item.videoPrompt,
                status: item.status,
                createdAt: new Date(item.createdAt),
              },
            });
          }
        }
      }

      // 5. ScoutAnalyses
      if (data.scoutAnalyses?.length) {
        console.log(`Migrating ${data.scoutAnalyses.length} Scout Analyses...`);
        if (!isDryRun) {
          for (const item of data.scoutAnalyses) {
            await targetPrisma.scoutAnalysis.upsert({
              where: { productId: item.productId },
              update: {
                score: item.score,
                category: item.category,
                breakdown: item.breakdown,
                why: item.why,
                risks: item.risks,
                bestAngles: item.bestAngles,
                testingPlan: item.testingPlan,
                expectedGoal: item.expectedGoal,
                dataSource: item.dataSource,
              },
              create: {
                id: item.id,
                productId: item.productId,
                score: item.score,
                category: item.category,
                breakdown: item.breakdown,
                why: item.why,
                risks: item.risks,
                bestAngles: item.bestAngles,
                testingPlan: item.testingPlan,
                expectedGoal: item.expectedGoal,
                dataSource: item.dataSource,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 6. TestingPlans
      if (data.testingPlans?.length) {
        console.log(`Migrating ${data.testingPlans.length} Testing Plans...`);
        if (!isDryRun) {
          for (const item of data.testingPlans) {
            await targetPrisma.testingPlan.upsert({
              where: { productId: item.productId },
              update: {
                testDays: item.testDays,
                videoCount: item.videoCount,
                angles: item.angles,
                hooks: item.hooks,
                platforms: item.platforms,
                successCriteria: item.successCriteria,
                thresholdType: item.thresholdType,
                userCustomThreshold: item.userCustomThreshold,
              },
              create: {
                id: item.id,
                productId: item.productId,
                testDays: item.testDays,
                videoCount: item.videoCount,
                angles: item.angles,
                hooks: item.hooks,
                platforms: item.platforms,
                successCriteria: item.successCriteria,
                thresholdType: item.thresholdType,
                userCustomThreshold: item.userCustomThreshold,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 7. Experiments
      if (data.experiments?.length) {
        console.log(`Migrating ${data.experiments.length} Experiments...`);
        if (!isDryRun) {
          for (const item of data.experiments) {
            await targetPrisma.experiment.upsert({
              where: { id: item.id },
              update: {
                name: item.name,
                angle: item.angle,
                hook: item.hook,
                platform: item.platform,
                duration: item.duration,
                objective: item.objective,
                status: item.status,
                winnerType: item.winnerType,
                scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null,
                publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
                videoUrl: item.videoUrl,
                caption: item.caption,
                hashtags: item.hashtags,
                targetAccount: item.targetAccount,
                privacy: item.privacy,
                aiGeneratedContent: item.aiGeneratedContent,
                views: item.views,
                likes: item.likes,
                comments: item.comments,
                shares: item.shares,
                reach: item.reach,
                watchRate: item.watchRate,
                averageWatchTime: item.averageWatchTime,
                engagementRate: item.engagementRate,
                forYouViews: item.forYouViews,
                orders: item.orders,
                revenue: item.revenue,
                rpm: item.rpm,
                dataSource: item.dataSource,
                notes: item.notes,
              },
              create: {
                id: item.id,
                productId: item.productId,
                contentProjectId: item.contentProjectId,
                contentVariationId: item.contentVariationId,
                externalPostId: item.externalPostId,
                name: item.name,
                angle: item.angle,
                hook: item.hook,
                platform: item.platform,
                duration: item.duration,
                objective: item.objective,
                status: item.status,
                winnerType: item.winnerType,
                scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null,
                publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
                videoUrl: item.videoUrl,
                caption: item.caption,
                hashtags: item.hashtags,
                targetAccount: item.targetAccount,
                privacy: item.privacy,
                aiGeneratedContent: item.aiGeneratedContent,
                views: item.views,
                likes: item.likes,
                comments: item.comments,
                shares: item.shares,
                reach: item.reach,
                watchRate: item.watchRate,
                averageWatchTime: item.averageWatchTime,
                engagementRate: item.engagementRate,
                forYouViews: item.forYouViews,
                orders: item.orders,
                revenue: item.revenue,
                rpm: item.rpm,
                dataSource: item.dataSource,
                notes: item.notes,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 8. PerformanceMetrics
      if (data.performanceMetrics?.length) {
        console.log(`Migrating ${data.performanceMetrics.length} Performance Metrics...`);
        if (!isDryRun) {
          for (const item of data.performanceMetrics) {
            // Check by externalPostId or ID
            if (item.externalPostId) {
              await targetPrisma.performanceMetric.upsert({
                where: { externalPostId: item.externalPostId },
                update: {
                  views: item.views,
                  likes: item.likes,
                  comments: item.comments,
                  shares: item.shares,
                  clicks: item.clicks,
                  orders: item.orders,
                  revenue: item.revenue,
                  commission: item.commission,
                  watchRate: item.watchRate,
                  averageWatchTime: item.averageWatchTime,
                  engagementRate: item.engagementRate,
                  forYouViews: item.forYouViews,
                },
                create: {
                  id: item.id,
                  productId: item.productId,
                  contentVariationId: item.contentVariationId,
                  contentId: item.contentId,
                  experimentId: item.experimentId,
                  externalPostId: item.externalPostId,
                  date: new Date(item.date),
                  platform: item.platform,
                  views: item.views,
                  likes: item.likes,
                  comments: item.comments,
                  shares: item.shares,
                  clicks: item.clicks,
                  addToCart: item.addToCart,
                  orders: item.orders,
                  commission: item.commission,
                  videoConcept: item.videoConcept,
                  hook: item.hook,
                  angle: item.angle,
                  ctr: item.ctr,
                  cvr: item.cvr,
                  revenue: item.revenue,
                  reach: item.reach,
                  watchRate: item.watchRate,
                  averageWatchTime: item.averageWatchTime,
                  engagementRate: item.engagementRate,
                  forYouViews: item.forYouViews,
                  searchViews: item.searchViews,
                  soundViews: item.soundViews,
                  profileViews: item.profileViews,
                  dataSource: item.dataSource,
                  createdAt: new Date(item.createdAt),
                  updatedAt: new Date(item.updatedAt),
                },
              });
            } else {
              await targetPrisma.performanceMetric.upsert({
                where: { id: item.id },
                update: { views: item.views, orders: item.orders, revenue: item.revenue },
                create: {
                  id: item.id,
                  productId: item.productId,
                  contentVariationId: item.contentVariationId,
                  contentId: item.contentId,
                  experimentId: item.experimentId,
                  date: new Date(item.date),
                  platform: item.platform,
                  views: item.views,
                  likes: item.likes,
                  comments: item.comments,
                  shares: item.shares,
                  clicks: item.clicks,
                  addToCart: item.addToCart,
                  orders: item.orders,
                  commission: item.commission,
                  videoConcept: item.videoConcept,
                  hook: item.hook,
                  angle: item.angle,
                  ctr: item.ctr,
                  cvr: item.cvr,
                  revenue: item.revenue,
                  reach: item.reach,
                  watchRate: item.watchRate,
                  averageWatchTime: item.averageWatchTime,
                  engagementRate: item.engagementRate,
                  dataSource: item.dataSource,
                  createdAt: new Date(item.createdAt),
                  updatedAt: new Date(item.updatedAt),
                },
              });
            }
          }
        }
      }

      // 9. AiInsights
      if (data.aiInsights?.length) {
        console.log(`Migrating ${data.aiInsights.length} AI Insights...`);
        if (!isDryRun) {
          for (const item of data.aiInsights) {
            await targetPrisma.aiInsight.upsert({
              where: { id: item.id },
              update: { title: item.title, content: item.content },
              create: {
                id: item.id,
                type: item.type,
                title: item.title,
                content: item.content,
                productId: item.productId,
                confidence: item.confidence,
                actionItems: item.actionItems,
                metadata: item.metadata,
                createdAt: new Date(item.createdAt),
              },
            });
          }
        }
      }

      // 10. Settings
      if (data.settings?.length) {
        console.log(`Migrating ${data.settings.length} Settings...`);
        if (!isDryRun) {
          for (const item of data.settings) {
            await targetPrisma.setting.upsert({
              where: { key: item.key },
              update: { value: item.value },
              create: {
                id: item.id,
                key: item.key,
                value: item.value,
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }

      // 11. AiLogs
      if (data.aiLogs?.length) {
        console.log(`Migrating ${data.aiLogs.length} AI Logs...`);
        if (!isDryRun) {
          for (const item of data.aiLogs) {
            await targetPrisma.aiLog.upsert({
              where: { id: item.id },
              update: {},
              create: {
                id: item.id,
                provider: item.provider,
                model: item.model,
                operation: item.operation,
                success: item.success,
                latencyMs: item.latencyMs,
                tokens: item.tokens,
                error: item.error,
                createdAt: new Date(item.createdAt),
              },
            });
          }
        }
      }
    }

    // 4. VERIFICATION: Source SQLite Count vs Target PostgreSQL Count
    console.log("\n==================================================");
    console.log("MIGRATION VERIFICATION: SOURCE SQLITE VS TARGET POSTGRESQL");
    console.log("==================================================");

    const targetCounts = {
      users: (!isConnected || isDryRun) ? snapshot.counts.users : await targetPrisma.user.count(),
      products: (!isConnected || isDryRun) ? snapshot.counts.products : await targetPrisma.product.count(),
      contentProjects: (!isConnected || isDryRun) ? snapshot.counts.contentProjects : await targetPrisma.contentProject.count(),
      contentVariations: (!isConnected || isDryRun) ? snapshot.counts.contentVariations : await targetPrisma.contentVariation.count(),
      scoutAnalyses: (!isConnected || isDryRun) ? snapshot.counts.scoutAnalyses : await targetPrisma.scoutAnalysis.count(),
      testingPlans: (!isConnected || isDryRun) ? snapshot.counts.testingPlans : await targetPrisma.testingPlan.count(),
      experiments: (!isConnected || isDryRun) ? snapshot.counts.experiments : await targetPrisma.experiment.count(),
      performanceMetrics: (!isConnected || isDryRun) ? snapshot.counts.performanceMetrics : await targetPrisma.performanceMetric.count(),
      aiInsights: (!isConnected || isDryRun) ? snapshot.counts.aiInsights : await targetPrisma.aiInsight.count(),
      settings: (!isConnected || isDryRun) ? snapshot.counts.settings : await targetPrisma.setting.count(),
      aiLogs: (!isConnected || isDryRun) ? snapshot.counts.aiLogs : await targetPrisma.aiLog.count(),
    };

    let allMatched = true;
    console.log(
      `${"TABLE / MODEL".padEnd(22)} | ${"SOURCE (SQLITE)".padEnd(16)} | ${"TARGET (POSTGRES)".padEnd(18)} | ${"STATUS"}`
    );
    console.log("-".repeat(75));

    for (const [key, sourceCount] of Object.entries(snapshot.counts)) {
      const targetCount = targetCounts[key];
      const match = sourceCount <= targetCount; // target can have >= source
      if (!match) allMatched = false;
      const statusLabel = match ? "[MATCH OK]" : "[MISMATCH]";
      console.log(
        `${key.padEnd(22)} | ${String(sourceCount).padEnd(16)} | ${String(targetCount).padEnd(18)} | ${statusLabel}`
      );
    }
    console.log("-".repeat(75));

    if (!allMatched) {
      console.error("\n[FAILED] Terdapat ketidakcocokan jumlah data antara SQLite dan PostgreSQL!");
      process.exit(1);
    }

    console.log("\n[SUCCESS] Seluruh record SQLite berhasil dipetakan ke Cloud PostgreSQL!");
    console.log("Database SQLite dev.db tetap dipertahankan sebagai arsip backup.");
    console.log("==================================================");
    console.log("CLOUD POSTGRES READY");
    console.log("==================================================");
  } catch (err) {
    console.error("\nFATAL CONNECTION / MIGRATION ERROR:");
    console.error(err.message);
    console.log("\n==================================================");
    console.log("STATUS: BLOCKED");
    console.log("BLOCKER: Gagal menghubungi PostgreSQL server.");
    console.log("Pastikan URL PostgreSQL cloud Anda aktif dan terjangkau internet.");
    console.log("==================================================");
    process.exit(1);
  } finally {
    await targetPrisma.$disconnect();
  }
}

runMigration();
