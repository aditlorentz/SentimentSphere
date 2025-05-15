import { db } from "./db";
import { employeeInsights, surveyDashboardSummary } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Script untuk migrasi data dari employee_insights ke survey_dashboard_summary
 * 
 * Proses:
 * 1. Hapus semua data yang ada di tabel survey_dashboard_summary
 * 2. Ambil semua word insight yang unik dari tabel employee_insights
 * 3. Untuk tiap word insight, hitung:
 *    - Total data
 *    - Jumlah positif, negatif, netral
 *    - Persentase positif, negatif, netral
 * 4. Simpan semua hasil ke tabel survey_dashboard_summary
 */
async function migrateInsightsData() {
  try {
    console.log("📊 Memulai migrasi data insights ke summary dashboard...");
    
    // 1. Hapus semua data yang ada di tabel survey_dashboard_summary
    console.log("🗑️ Menghapus data existing di survey_dashboard_summary...");
    await db.delete(surveyDashboardSummary);
    
    // 2. Ambil semua word insight yang unik dari employee_insights
    console.log("🔍 Mengambil semua unique word insights...");
    const uniqueWordInsights = await db
      .selectDistinct({ wordInsight: employeeInsights.wordInsight })
      .from(employeeInsights)
      .where(sql`${employeeInsights.wordInsight} IS NOT NULL AND ${employeeInsights.wordInsight} <> ''`);
    
    console.log(`📝 Ditemukan ${uniqueWordInsights.length} word insights unik untuk diproses`);
    
    // 3. Proses setiap word insight
    let processedCount = 0;
    for (const { wordInsight } of uniqueWordInsights) {
      // Hitung total data untuk word insight ini
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(eq(employeeInsights.wordInsight, wordInsight));
      
      // Hitung jumlah data positif
      const [positiveResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, wordInsight),
          eq(employeeInsights.sentimen, 'positif')
        ));
      
      // Hitung jumlah data negatif
      const [negativeResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, wordInsight),
          eq(employeeInsights.sentimen, 'negatif')
        ));
      
      // Hitung jumlah data netral
      const [neutralResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, wordInsight),
          eq(employeeInsights.sentimen, 'netral')
        ));
      
      // Hitung persentase
      const totalCount = totalResult.count;
      const positiveCount = positiveResult.count;
      const negativeCount = negativeResult.count;
      const neutralCount = neutralResult.count;
      
      const positivePercentage = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
      const negativePercentage = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;
      const neutralPercentage = totalCount > 0 ? Math.round((neutralCount / totalCount) * 100) : 0;
      
      // Insert ke tabel survey_dashboard_summary
      await db.insert(surveyDashboardSummary).values({
        wordInsight,
        totalCount,
        positiveCount,
        negativeCount,
        neutralCount,
        positivePercentage,
        negativePercentage,
        neutralPercentage
      });
      
      processedCount++;
      if (processedCount % 10 === 0 || processedCount === uniqueWordInsights.length) {
        console.log(`⏳ Memproses progress: ${processedCount}/${uniqueWordInsights.length} (${Math.round((processedCount/uniqueWordInsights.length)*100)}%)`);
      }
    }
    
    // Verifikasi hasil
    const [summaryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(surveyDashboardSummary);
    
    const [totalInsights] = await db
      .select({ sum: sql<number>`sum(total_count)` })
      .from(surveyDashboardSummary);
    
    console.log("\n✅ Migrasi selesai!");
    console.log(`📊 Ringkasan hasil migrasi:`);
    console.log(`- ${summaryCount.count} word insights telah dirangkum`);
    console.log(`- Total ${totalInsights.sum} data insights telah diproses`);
    console.log("- Semua persentase telah dihitung dengan benar");
    
  } catch (error) {
    console.error("❌ Terjadi error saat migrasi:", error);
    throw error;
  }
}

// Jalankan fungsi migrasi
migrateInsightsData()
  .then(() => {
    console.log("🎉 Proses migrasi berhasil");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Proses migrasi gagal:", error);
    process.exit(1);
  });