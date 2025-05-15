import { db } from "./db";
import { employeeInsights, surveyDashboardSummary } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Script untuk verifikasi dan perhitungan ulang total_count, positive_count, negative_count, dan neutral_count
 * pada tabel survey_dashboard_summary, serta memperbarui persentasenya
 */
async function verifyAndReCalculateCounts() {
  try {
    console.log("🔎 Memulai verifikasi dan perhitungan ulang count dan persentase...");
    
    // 1. Ambil semua word insights dari surveyDashboardSummary
    const summaryRecords = await db
      .select()
      .from(surveyDashboardSummary);
    
    console.log(`📊 Menemukan ${summaryRecords.length} word insights untuk diperiksa`);
    
    // 2. Periksa dan hitung ulang untuk setiap record
    for (let i = 0; i < summaryRecords.length; i++) {
      const summary = summaryRecords[i];
      console.log(`⏳ Memverifikasi word insight [${i+1}/${summaryRecords.length}]: ${summary.wordInsight}`);
      
      // Dapatkan jumlah sebenarnya dari tabel employee_insights
      const [totalCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(eq(employeeInsights.wordInsight, summary.wordInsight));
      
      const [positiveCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, summary.wordInsight),
          eq(employeeInsights.sentimen, 'positif')
        ));
      
      const [negativeCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, summary.wordInsight),
          eq(employeeInsights.sentimen, 'negatif')
        ));
      
      const [neutralCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employeeInsights)
        .where(and(
          eq(employeeInsights.wordInsight, summary.wordInsight),
          eq(employeeInsights.sentimen, 'netral')
        ));
      
      // 3. Hitung persentase dengan benar
      const actualTotal = Number(totalCount.count);
      const actualPositive = Number(positiveCount.count);
      const actualNegative = Number(negativeCount.count);
      const actualNeutral = Number(neutralCount.count);
      
      // Pastikan persentase tepat dan jumlahnya 100%
      let positivePercentage = actualTotal > 0 ? Math.round((actualPositive / actualTotal) * 100) : 0;
      let negativePercentage = actualTotal > 0 ? Math.round((actualNegative / actualTotal) * 100) : 0;
      let neutralPercentage = actualTotal > 0 ? Math.round((actualNeutral / actualTotal) * 100) : 0;
      
      // Koreksi total persentase jika tidak 100%
      const totalPercentage = positivePercentage + negativePercentage + neutralPercentage;
      
      if (actualTotal > 0 && totalPercentage !== 100) {
        console.log(`  - Koreksi persentase untuk "${summary.wordInsight}": total persentase adalah ${totalPercentage}%`);
        
        // Jika > 100%, kurangi dari yang terbesar
        if (totalPercentage > 100) {
          const diff = totalPercentage - 100;
          if (positivePercentage >= negativePercentage && positivePercentage >= neutralPercentage) {
            positivePercentage -= diff;
          } else if (negativePercentage >= positivePercentage && negativePercentage >= neutralPercentage) {
            negativePercentage -= diff;
          } else {
            neutralPercentage -= diff;
          }
        } 
        // Jika < 100%, tambahkan ke yang terbesar
        else if (totalPercentage < 100) {
          const diff = 100 - totalPercentage;
          if (positivePercentage >= negativePercentage && positivePercentage >= neutralPercentage) {
            positivePercentage += diff;
          } else if (negativePercentage >= positivePercentage && negativePercentage >= neutralPercentage) {
            negativePercentage += diff;
          } else {
            neutralPercentage += diff;
          }
        }
        
        console.log(`  - Persentase setelah koreksi: positif=${positivePercentage}%, negatif=${negativePercentage}%, netral=${neutralPercentage}%`);
      }
      
      // 4. Periksa apakah ada perbedaan dengan data yang ada di database
      if (
        summary.totalCount !== actualTotal ||
        summary.positiveCount !== actualPositive ||
        summary.negativeCount !== actualNegative ||
        summary.neutralCount !== actualNeutral ||
        summary.positivePercentage !== positivePercentage ||
        summary.negativePercentage !== negativePercentage ||
        summary.neutralPercentage !== neutralPercentage
      ) {
        console.log(`  - 🔄 Updating data untuk "${summary.wordInsight}"`);
        console.log(`    * Total: ${summary.totalCount} -> ${actualTotal}`);
        console.log(`    * Positif: ${summary.positiveCount} (${summary.positivePercentage}%) -> ${actualPositive} (${positivePercentage}%)`);
        console.log(`    * Negatif: ${summary.negativeCount} (${summary.negativePercentage}%) -> ${actualNegative} (${negativePercentage}%)`);
        console.log(`    * Netral: ${summary.neutralCount} (${summary.neutralPercentage}%) -> ${actualNeutral} (${neutralPercentage}%)`);
        
        // Update record di database
        await db.update(surveyDashboardSummary)
          .set({
            totalCount: actualTotal,
            positiveCount: actualPositive,
            negativeCount: actualNegative,
            neutralCount: actualNeutral,
            positivePercentage: positivePercentage,
            negativePercentage: negativePercentage,
            neutralPercentage: neutralPercentage,
            updatedAt: new Date()
          })
          .where(eq(surveyDashboardSummary.id, summary.id));
      } else {
        console.log(`  - ✅ Data untuk "${summary.wordInsight}" sudah benar`);
      }
    }
    
    // 5. Dapatkan summary perhitungan setelah update
    const [countAfterUpdate] = await db
      .select({
        totalRecords: sql<number>`count(*)`,
        totalSum: sql<number>`sum(total_count)`,
        positiveSum: sql<number>`sum(positive_count)`,
        negativeSum: sql<number>`sum(negative_count)`,
        neutralSum: sql<number>`sum(neutral_count)`
      })
      .from(surveyDashboardSummary);
    
    console.log("\n✅ Verifikasi dan perhitungan ulang selesai!");
    console.log(`📊 Ringkasan hasil akhir:`);
    console.log(`- Total word insights: ${countAfterUpdate.totalRecords}`);
    console.log(`- Total data: ${countAfterUpdate.totalSum}`);
    console.log(`- Total positif: ${countAfterUpdate.positiveSum} (${Math.round((countAfterUpdate.positiveSum / countAfterUpdate.totalSum) * 100)}%)`);
    console.log(`- Total negatif: ${countAfterUpdate.negativeSum} (${Math.round((countAfterUpdate.negativeSum / countAfterUpdate.totalSum) * 100)}%)`);
    console.log(`- Total netral: ${countAfterUpdate.neutralSum} (${Math.round((countAfterUpdate.neutralSum / countAfterUpdate.totalSum) * 100)}%)`);
    
    // Cek konsistensi data
    const totalPercentages = 
      Math.round((countAfterUpdate.positiveSum / countAfterUpdate.totalSum) * 100) +
      Math.round((countAfterUpdate.negativeSum / countAfterUpdate.totalSum) * 100) +
      Math.round((countAfterUpdate.neutralSum / countAfterUpdate.totalSum) * 100);
    
    if (totalPercentages !== 100) {
      console.log(`⚠️ Total persentase (${totalPercentages}%) tidak sama dengan 100%. Ini adalah artefak dari pembulatan.`);
    } else {
      console.log(`✅ Total persentase adalah ${totalPercentages}%, yang berarti sudah benar.`);
    }
    
    // Verifikasi dengan employee_insights
    const [employeeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employeeInsights);
    
    if (Number(countAfterUpdate.totalSum) === Number(employeeCount.count)) {
      console.log(`✅ VALIDASI BERHASIL: Total data (${countAfterUpdate.totalSum}) sama dengan jumlah record di employee_insights (${employeeCount.count})`);
    } else {
      console.log(`⚠️ VALIDASI GAGAL: Total data (${countAfterUpdate.totalSum}) tidak sama dengan jumlah record di employee_insights (${employeeCount.count})`);
      console.log(`  - Selisih: ${Math.abs(Number(countAfterUpdate.totalSum) - Number(employeeCount.count))} record`);
      console.log(`  - Kemungkinan penyebab: Ada data dengan word_insight NULL atau kosong, atau data duplikat`);
    }
    
  } catch (error) {
    console.error("❌ Terjadi error saat verifikasi dan perhitungan ulang:", error);
    throw error;
  }
}

// Jalankan fungsi verifikasi dan perhitungan
verifyAndReCalculateCounts()
  .then(() => {
    console.log("🎉 Proses verifikasi dan perhitungan ulang berhasil");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Proses verifikasi dan perhitungan ulang gagal:", error);
    process.exit(1);
  });