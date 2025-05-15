import { db } from "./db";
import { employeeInsights, surveyDashboardSummary } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Script untuk migrasi data dari employee_insights ke survey_dashboard_summary
 * Versi akhir yang lebih efisien, dengan query aggregation
 */
async function migrateAllInsights() {
  try {
    console.log("📊 Memulai migrasi data seluruh insights ke summary dashboard...");
    
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
    
    // 3. Proses setiap word insight dengan metode efisien
    const batchSize = 20; // Memproses sekaligus 20 word insights
    for (let i = 0; i < uniqueWordInsights.length; i += batchSize) {
      const batch = uniqueWordInsights.slice(i, i + batchSize);
      console.log(`⏳ Memproses batch ${i/batchSize + 1}/${Math.ceil(uniqueWordInsights.length/batchSize)}: ${i+1}-${Math.min(i+batchSize, uniqueWordInsights.length)} dari ${uniqueWordInsights.length}`);
      
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
    }
    
    // 4. Verifikasi hasil migrasi
    const [summaryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(surveyDashboardSummary);
    
    const [totalInsights] = await db
      .select({ sum: sql<number>`sum(total_count)` })
      .from(surveyDashboardSummary);
    
    const [employeeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employeeInsights);
    
    console.log("\n✅ Migrasi selesai!");
    console.log(`📊 Ringkasan hasil migrasi:`);
    console.log(`- ${summaryCount.count} word insights telah dirangkum`);
    console.log(`- Total ${totalInsights.sum} data insights telah diproses dari ${employeeCount.count} data employee_insights`);
    console.log("- Semua persentase telah dihitung dengan benar");
    
    // Bandingkan apakah jumlah sama
    if (Number(totalInsights.sum) === Number(employeeCount.count)) {
      console.log("✅ VALIDASI BERHASIL: Jumlah total data sama persis");
    } else {
      console.log("⚠️ VALIDASI PERLU DICEK: Total data berdasarkan word insight tidak sama dengan jumlah record");
      console.log(`  - Data di summary: ${totalInsights.sum}`);
      console.log(`  - Data di employee_insights: ${employeeCount.count}`);
      console.log("  - Kemungkinan penyebab: Ada data dengan word_insight NULL atau kosong");
    }
    
  } catch (error) {
    console.error("❌ Terjadi error saat migrasi:", error);
    throw error;
  }
}

// Jalankan fungsi migrasi
migrateAllInsights()
  .then(() => {
    console.log("🎉 Proses migrasi berhasil");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Proses migrasi gagal:", error);
    process.exit(1);
  });