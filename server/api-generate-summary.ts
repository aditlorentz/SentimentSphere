import { db } from "./db";
import { 
  employeeInsights, 
  surveyDashboardSummary, 
  topInsights, 
  topWordInsights 
} from "@shared/schema";
import { sql, eq, and } from "drizzle-orm";
import express from "express";

/**
 * Script untuk API endpoint yang dapat digunakan untuk melakukan 
 * regenerasi data survey_dashboard_summary secara on-demand melalui API
 */

// Membuat express router
const router = express.Router();

// Endpoint untuk regenerasi survey_dashboard_summary
router.post("/api/regenerate-survey-summary", async (req, res) => {
  try {
    console.log("🔄 Memulai regenerasi data survey dashboard...");
    
    // 1. Hapus semua data yang ada di tabel survey_dashboard_summary
    await db.delete(surveyDashboardSummary);
    
    // 2. Ambil semua word insight yang unik dari employee_insights
    const uniqueWordInsights = await db
      .selectDistinct({ wordInsight: employeeInsights.wordInsight })
      .from(employeeInsights)
      .where(sql`${employeeInsights.wordInsight} IS NOT NULL AND ${employeeInsights.wordInsight} <> ''`);
    
    console.log(`📝 Ditemukan ${uniqueWordInsights.length} word insights unik untuk diproses`);
    
    // 3. Proses setiap word insight dengan metode efisien
    const batchSize = 20; // Memproses sekaligus 20 word insights
    const totalBatches = Math.ceil(uniqueWordInsights.length / batchSize);
    
    for (let i = 0; i < uniqueWordInsights.length; i += batchSize) {
      const batch = uniqueWordInsights.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`⏳ Memproses batch ${batchNumber}/${totalBatches}: ${i+1}-${Math.min(i+batchSize, uniqueWordInsights.length)} dari ${uniqueWordInsights.length}`);
      
      const insightPromises = batch.map(async ({ wordInsight }) => {
        // Get all counts in a single database query using conditional aggregation
        const [result] = await db
          .select({
            totalCount: sql<number>`count(*)`,
            positiveCount: sql<number>`SUM(CASE WHEN ${employeeInsights.sentimen} = 'positif' THEN 1 ELSE 0 END)`,
            negativeCount: sql<number>`SUM(CASE WHEN ${employeeInsights.sentimen} = 'negatif' THEN 1 ELSE 0 END)`,
            neutralCount: sql<number>`SUM(CASE WHEN ${employeeInsights.sentimen} = 'netral' THEN 1 ELSE 0 END)`
          })
          .from(employeeInsights)
          .where(eq(employeeInsights.wordInsight, wordInsight));
        
        // Calculate percentages
        const totalCount = Number(result.totalCount);
        const positiveCount = Number(result.positiveCount);
        const negativeCount = Number(result.negativeCount);
        const neutralCount = Number(result.neutralCount);
        
        const positivePercentage = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
        const negativePercentage = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;
        const neutralPercentage = totalCount > 0 ? Math.round((neutralCount / totalCount) * 100) : 0;
        
        // Insert ke tabel survey_dashboard_summary
        return db.insert(surveyDashboardSummary).values({
          wordInsight,
          totalCount,
          positiveCount,
          negativeCount,
          neutralCount,
          positivePercentage,
          negativePercentage,
          neutralPercentage
        });
      });
      
      // Execute all promises in parallel for this batch
      await Promise.all(insightPromises);
      
      // Report progress
      const progress = Math.round((batchNumber / totalBatches) * 100);
      console.log(`Progress: ${progress}%`);
    }
    
    // 4. Verifikasi hasil regenerasi
    const [summaryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(surveyDashboardSummary);
    
    const [totalInsights] = await db
      .select({ sum: sql<number>`sum(total_count)` })
      .from(surveyDashboardSummary);
    
    console.log("\n✅ Regenerasi selesai!");
    
    // Kirim response sukses dengan detail hasil
    // Update both top_insights and top_word_insights tables
    console.log("🔄 Memperbarui tabel top_insights dan top_word_insights dengan 10 word insight teratas...");
    
    // Clear existing insights
    await db.delete(topInsights);
    await db.delete(topWordInsights);
    
    // Get top 10 word insights based on total_count
    const topInsightsList = await db
      .select({
        wordInsight: surveyDashboardSummary.wordInsight,
        totalCount: surveyDashboardSummary.totalCount
      })
      .from(surveyDashboardSummary)
      .orderBy(sql`${surveyDashboardSummary.totalCount} DESC`)
      .limit(10);
    
    // Insert into top_insights table (existing table)
    for (const insight of topInsightsList) {
      await db.insert(topInsights).values({
        wordInsight: insight.wordInsight,
        totalCount: insight.totalCount,
        location: 'n/a',
        source: 'n/a',
        employee: 'n/a',
        sentiment: 'n/a'
      });
    }
    
    // Insert into top_word_insights table (new simplified table)
    for (const insight of topInsightsList) {
      await db.insert(topWordInsights).values({
        wordInsight: insight.wordInsight,
        totalCount: insight.totalCount
      });
    }
    
    console.log(`✅ Berhasil menyimpan ${topInsightsList.length} word insight teratas ke tabel top_insights dan top_word_insights`);
    
    res.json({
      success: true,
      message: "Regenerasi survey dashboard summary dan top insights berhasil",
      stats: {
        totalWordInsightsProcessed: summaryCount.count,
        totalDataProcessed: totalInsights.sum,
        topInsightsUpdated: topInsightsList.length
      }
    });
  } catch (error: any) {
    console.error("❌ Terjadi error saat regenerasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal melakukan regenerasi survey dashboard summary",
      error: error.message || String(error)
    });
  }
});

/**
 * Tambahkan fungsi untuk mendaftarkan router ke aplikasi express
 */
export function registerSummaryRegenerationRoutes(app) {
  app.use(router);
  return app;
}