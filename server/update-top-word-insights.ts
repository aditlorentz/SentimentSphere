/**
 * Script untuk memperbarui tabel top_word_insights dengan 10 word insight dengan total count terbanyak
 * dari tabel survey_dashboard_summary
 */

import { db } from "./db";
import { surveyDashboardSummary } from "@shared/schema";
import { topWordInsights } from "@shared/schema-top-insights";
import { sql } from "drizzle-orm";

async function updateTopWordInsights() {
  try {
    console.log("🔎 Memulai update top word insights...");
    
    // 1. Hapus data lama dari tabel top_word_insights
    console.log("🗑️ Menghapus data lama dari top_word_insights...");
    await db.delete(topWordInsights);
    
    // 2. Ambil 10 word insight dengan total count terbanyak dari survey_dashboard_summary
    console.log("📊 Mengambil 10 word insight teratas dari survey_dashboard_summary...");
    const topInsights = await db
      .select({
        wordInsight: surveyDashboardSummary.wordInsight,
        totalCount: surveyDashboardSummary.totalCount
      })
      .from(surveyDashboardSummary)
      .orderBy(sql`${surveyDashboardSummary.totalCount} DESC`)
      .limit(10);
    
    // 3. Simpan ke tabel top_word_insights
    console.log("📝 Menyimpan data ke tabel top_word_insights...");
    for (const insight of topInsights) {
      await db.insert(topWordInsights).values({
        wordInsight: insight.wordInsight,
        totalCount: insight.totalCount
      });
    }
    
    // 4. Tampilkan hasilnya untuk verifikasi
    console.log("✅ Berhasil menyimpan 10 word insight teratas:");
    for (let i = 0; i < topInsights.length; i++) {
      console.log(`  ${i+1}. ${topInsights[i].wordInsight} (${topInsights[i].totalCount} data)`);
    }
    
    console.log("🎉 Proses update top word insights berhasil");
  } catch (error: any) {
    console.error("❌ Terjadi error saat update top word insights:", error);
  }
}

// Jalankan fungsi utama
updateTopWordInsights();