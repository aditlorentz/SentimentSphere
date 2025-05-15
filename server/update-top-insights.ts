import { db } from "./db";
import { topInsights, surveyDashboardSummary } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Script untuk mengupdate tabel top_insights dengan 10 word_insight terbanyak dari survey_dashboard_summary
 */
async function updateTopInsights() {
  try {
    console.log("🔎 Memulai update top insights...");
    
    // Kosongkan tabel top_insights terlebih dahulu
    console.log("🗑️ Menghapus data lama dari top_insights...");
    await db.delete(topInsights);
    
    // Mendapatkan 10 word insight dengan total_count terbanyak
    console.log("📊 Mengambil 10 word insight teratas dari survey_dashboard_summary...");
    const topWordInsights = await db
      .select({
        wordInsight: surveyDashboardSummary.wordInsight,
        totalCount: surveyDashboardSummary.totalCount
      })
      .from(surveyDashboardSummary)
      .orderBy(sql`${surveyDashboardSummary.totalCount} DESC`)
      .limit(10);
    
    // Memasukkan data ke tabel top_insights
    console.log("📝 Menyimpan data ke tabel top_insights...");
    const insertPromises = topWordInsights.map(insight => {
      return db.insert(topInsights).values({
        wordInsight: insight.wordInsight,
        totalCount: insight.totalCount,
        // Field lain diisi dengan default value
        location: 'n/a',
        source: 'n/a',
        employee: 'n/a',
        sentiment: 'n/a'
      });
    });
    
    await Promise.all(insertPromises);
    
    // Verifikasi hasil
    const insertedRecords = await db
      .select({
        id: topInsights.id,
        wordInsight: topInsights.wordInsight,
        totalCount: topInsights.totalCount
      })
      .from(topInsights)
      .orderBy(sql`${topInsights.totalCount} DESC`);
    
    console.log(`✅ Berhasil menyimpan ${insertedRecords.length} word insight teratas:`);
    insertedRecords.forEach((record, index) => {
      console.log(`  ${index+1}. ${record.wordInsight} (${record.totalCount} data)`);
    });
    
  } catch (error) {
    console.error("❌ Terjadi error saat update top insights:", error);
    throw error;
  }
}

// Jalankan fungsi update
updateTopInsights()
  .then(() => {
    console.log("🎉 Proses update top insights berhasil");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Proses update top insights gagal:", error);
    process.exit(1);
  });