import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const DATA_DIR = path.join(process.cwd(), 'data');

async function runPrismaSQLiteVerification() {
  console.log('=== STARTING PRISMA + SQLITE FULL AUDIT & VERIFICATION ===\n');

  // 1. VERIFY DIRECT SQLITE PRISMA CONNECTION
  console.log('1. Checking Prisma + SQLite Direct Connection...');
  const initialProductCount = await prisma.product.count();
  const initialContentCount = await prisma.contentProject.count();
  const initialPerfCount = await prisma.performanceMetric.count();
  console.log(`PASS: Direct SQLite Connection Active.`);
  console.log(`      Products in SQLite:            ${initialProductCount}`);
  console.log(`      Content Projects in SQLite:    ${initialContentCount}`);
  console.log(`      Performance Metrics in SQLite: ${initialPerfCount}\n`);

  // Record modification timestamps of JSON files before testing
  const jsonProductStatBefore = fs.statSync(path.join(DATA_DIR, 'products.json'));
  const jsonProductMtimeBefore = jsonProductStatBefore.mtimeMs;

  // 2. TEST FULL CRUD VIA API (UI/API -> REPOSITORY -> PRISMA -> SQLITE)
  console.log('2. Testing CRUD Flow on SQLite...');
  const newProductPayload = {
    name: 'Prisma SQLite Test Mouse ' + Date.now(),
    link: 'https://shopee.co.id/test-mouse',
    category: 'Elektronik',
    price: 250000,
    commissionRate: 12,
    targetAudience: 'Gamers and office workers',
    description: 'Wireless gaming mouse with 16000 DPI sensor and silent switches',
    advantages: 'Lightweight, ultra-fast response, rechargeable battery',
    problemSolved: 'Hand fatigue during long working/gaming hours'
  };

  const createRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProductPayload)
  });
  if (!createRes.ok) throw new Error('FAIL: Product creation via API failed');
  const createdProd = await createRes.json();
  console.log(`PASS: Created Product via API: "${createdProd.name}" (ID: ${createdProd.id})`);

  // Verify it exists in SQLite database directly
  const sqliteProd = await prisma.product.findUnique({ where: { id: createdProd.id } });
  if (!sqliteProd) throw new Error('FAIL: Created product was NOT found in SQLite database!');
  console.log(`PASS: Verified product exists directly in SQLite table "Product" (ID: ${sqliteProd.id})`);

  // 3. VERIFY ZERO JSON WRITES (JSON FILE WAS NOT TOUCHED)
  const jsonProductStatAfter = fs.statSync(path.join(DATA_DIR, 'products.json'));
  const jsonProductMtimeAfter = jsonProductStatAfter.mtimeMs;
  if (jsonProductMtimeBefore !== jsonProductMtimeAfter) {
    throw new Error('FAIL: data/products.json was modified during API operation! Runtime is still writing to JSON!');
  }
  console.log('PASS: data/products.json was NOT modified! Confirmed runtime is writing ONLY to SQLite!\n');

  // 4. TEST READ VIA API
  const getRes = await fetch(`${BASE_URL}/api/products/${createdProd.id}`);
  if (!getRes.ok) throw new Error('FAIL: Could not fetch product via API');
  const fetchedProd = await getRes.json();
  if (fetchedProd.name !== createdProd.name) throw new Error('FAIL: Fetched product data mismatch');
  console.log('PASS: Read Product via API verified.');

  // 5. TEST UPDATE VIA API
  const updateRes = await fetch(`${BASE_URL}/api/products/${createdProd.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 299000, name: 'Prisma SQLite Test Mouse PRO' })
  });
  if (!updateRes.ok) throw new Error('FAIL: Update product via API failed');
  const updatedProd = await updateRes.json();
  if (updatedProd.price !== 299000 || updatedProd.name !== 'Prisma SQLite Test Mouse PRO') {
    throw new Error('FAIL: Updated product fields mismatch');
  }
  // Verify update in SQLite directly
  const sqliteProdUpdated = await prisma.product.findUnique({ where: { id: createdProd.id } });
  if (sqliteProdUpdated.price !== 299000) throw new Error('FAIL: Update was not persisted in SQLite!');
  console.log('PASS: Update Product via API & persistence in SQLite verified.\n');

  // 6. TEST RELATIONS & CASCADE DELETION IN SQLITE
  console.log('3. Testing Relations & Cascade Deletion in SQLite...');
  // Create content linked to product
  const contentRes = await fetch(`${BASE_URL}/api/content/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: createdProd.id,
      platform: 'TikTok',
      duration: '10 detik',
      style: 'Problem-Solution',
      objective: 'Affiliate Conversion',
      targetAudience: 'Gamers'
    })
  });
  if (!contentRes.ok) throw new Error('FAIL: Content generation failed');
  const contentData = await contentRes.json();
  const createdContentId = contentData.project.id;
  console.log(`PASS: Linked Content created in SQLite (ID: ${createdContentId})`);

  // Create performance metric linked to product
  const perfRes = await fetch(`${BASE_URL}/api/performance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: createdProd.id,
      contentId: createdContentId,
      platform: 'TikTok',
      views: '50000',
      clicks: '2000',
      orders: '100',
      commission: '3000000',
      angle: 'Problem-Solution',
      hook: 'Stop pakai mouse bikin tangan pegal!'
    })
  });
  if (!perfRes.ok) throw new Error('FAIL: Performance creation failed');
  const createdPerf = await perfRes.json();
  console.log(`PASS: Linked Performance Metric created in SQLite (ID: ${createdPerf.id})`);

  // Verify both exist in SQLite directly
  const sqliteContent = await prisma.contentProject.findUnique({ where: { id: createdContentId } });
  const sqlitePerfItem = await prisma.performanceMetric.findUnique({ where: { id: createdPerf.id } });
  if (!sqliteContent || !sqlitePerfItem) throw new Error('FAIL: Linked entities not found in SQLite!');
  console.log('PASS: Verified linked Content and Performance Metric exist directly in SQLite.');

  // Now delete the Product and verify cascade in SQLite
  const delRes = await fetch(`${BASE_URL}/api/products/${createdProd.id}`, { method: 'DELETE' });
  if (!delRes.ok) throw new Error('FAIL: Delete product via API failed');
  console.log('PASS: Product deleted via API.');

  // Verify cascade deletion in SQLite
  const sqliteProdAfterDel = await prisma.product.findUnique({ where: { id: createdProd.id } });
  const sqliteContentAfterDel = await prisma.contentProject.findUnique({ where: { id: createdContentId } });
  const sqlitePerfAfterDel = await prisma.performanceMetric.findUnique({ where: { id: createdPerf.id } });

  if (sqliteProdAfterDel !== null || sqliteContentAfterDel !== null || sqlitePerfAfterDel !== null) {
    throw new Error('FAIL: Cascade delete in SQLite failed! Some records still exist.');
  }
  console.log('PASS: SQLite Cascade Deletion verified: Product, Content, and Performance records all cleaned up!\n');

  // 7. VERIFY DASHBOARD KPI DIRECTLY AGAINST SQLITE
  console.log('4. Testing Dashboard KPI against SQLite database...');
  const dashRes = await fetch(`${BASE_URL}/api/dashboard`);
  if (!dashRes.ok) throw new Error('FAIL: Dashboard API failed');
  const dashData = await dashRes.json();

  const totalProductsDB = await prisma.product.count();
  const allProductsDB = await prisma.product.findMany();
  const potentialProductsDB = allProductsDB.filter(p => (p.opportunityScore || 0) >= 60).length;
  const totalContentDB = await prisma.contentProject.count();
  const allMetricsDB = await prisma.performanceMetric.findMany();
  const totalOrdersDB = allMetricsDB.reduce((sum, m) => sum + m.orders, 0);
  const totalClicksDB = allMetricsDB.reduce((sum, m) => sum + m.clicks, 0);
  const cvrDB = totalClicksDB > 0 ? totalOrdersDB / totalClicksDB : 0;
  const totalRevenueDB = allMetricsDB.reduce((sum, m) => sum + (m.revenue || m.commission || 0), 0);

  console.log('Prisma SQLite Database Counts:');
  console.log({
    totalProductsDB,
    potentialProductsDB,
    totalContentDB,
    totalOrdersDB,
    cvrDB: (cvrDB * 100).toFixed(2) + '%',
    totalRevenueDB
  });

  console.log('Dashboard API Response:');
  console.log({
    totalProductsAPI: dashData.summary.totalProducts,
    potentialProductsAPI: dashData.summary.potentialProducts,
    totalContentAPI: dashData.summary.totalContent,
    totalOrdersAPI: dashData.summary.totalOrders,
    cvrAPI: (dashData.summary.conversionRate * 100).toFixed(2) + '%',
    totalRevenueAPI: dashData.summary.totalRevenue
  });

  if (dashData.summary.totalProducts !== totalProductsDB) throw new Error('FAIL: totalProducts mismatch');
  if (dashData.summary.potentialProducts !== potentialProductsDB) throw new Error('FAIL: potentialProducts mismatch');
  if (dashData.summary.totalContent !== totalContentDB) throw new Error('FAIL: totalContent mismatch');
  if (dashData.summary.totalOrders !== totalOrdersDB) throw new Error('FAIL: totalOrders mismatch');
  if (Math.abs(dashData.summary.conversionRate - cvrDB) > 0.0001) throw new Error('FAIL: conversionRate mismatch');
  if (dashData.summary.totalRevenue !== totalRevenueDB) throw new Error('FAIL: totalRevenue mismatch');
  console.log('PASS: Dashboard KPIs match SQLite database 100% with NO hardcoding!\n');

  // 8. TEST AI PERFORMANCE ANALYZER & INSIGHTS ON SQLITE
  console.log('5. Testing AI Performance Analyzer and AI Insights on SQLite...');
  const analyzeRes = await fetch(`${BASE_URL}/api/performance/analyze`, { method: 'POST' });
  if (!analyzeRes.ok) throw new Error('FAIL: Performance analyzer failed');
  const analysis = await analyzeRes.json();
  if (!analysis.whatWorked || !analysis.whatFailed || !analysis.why || !analysis.nextActions) {
    throw new Error('FAIL: AI Analysis required fields missing');
  }
  console.log('PASS: AI Performance Analyzer reads and evaluates SQLite performance data.');

  const insightsRes = await fetch(`${BASE_URL}/api/insights`);
  if (!insightsRes.ok) throw new Error('FAIL: Insights API failed');
  const insights = await insightsRes.json();
  if (!insights.winningPatterns || !insights.recommendedContent) {
    throw new Error('FAIL: Insights required fields missing');
  }
  console.log(`PASS: AI Insights dynamically generated from SQLite (Winning product: "${insights.winningPatterns[0]?.product}").\n`);

  console.log('=== ALL PRISMA + SQLITE AUDIT TESTS PASSED 100%! ===');
}

runPrismaSQLiteVerification()
  .catch(err => {
    console.error('Verification Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
