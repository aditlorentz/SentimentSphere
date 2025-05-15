import { db } from "./db";
import { surveyDashboardSummary } from "@shared/schema";

/**
 * Script yang lebih efisien untuk memperbaiki perhitungan persentase pada survey_dashboard_summary
 * Menggunakan metode batch query untuk menghindari timeout
 */
async function fixPercentages() {
  try {
    console.log("🔎 Memulai perbaikan persentase...");
    
    // Ambil semua record dari survey_dashboard_summary
    const summaryRecords = await db
      .select()
      .from(surveyDashboardSummary);
    
    console.log(`📊 Menemukan ${summaryRecords.length} word insights untuk diperbaiki persentasenya`);
    let updateCount = 0;
    
    // Proses batch untuk update
    const batchSize = 20;
    
    for (let i = 0; i < summaryRecords.length; i += batchSize) {
      const batch = summaryRecords.slice(i, i + batchSize);
      console.log(`⏳ Memproses batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(summaryRecords.length/batchSize)} (${i+1}-${Math.min(i+batchSize, summaryRecords.length)})`);
      
      const updatePromises = batch.map(async (record) => {
        // Hitung persentase yang benar
        const { id, totalCount, positiveCount, negativeCount, neutralCount } = record;
        
        if (totalCount <= 0) return null; // Skip jika tidak ada data
        
        // Hitung persentase dengan pembulatan yang benar
        let positivePercentage = Math.round((positiveCount / totalCount) * 100);
        let negativePercentage = Math.round((negativeCount / totalCount) * 100);
        let neutralPercentage = Math.round((neutralCount / totalCount) * 100);
        
        // Periksa total persentase
        const totalPercentage = positivePercentage + negativePercentage + neutralPercentage;
        
        if (totalPercentage !== 100) {
          console.log(`  - Koreksi persentase untuk ID ${id}: total persentase adalah ${totalPercentage}%`);
          
          // Koreksi untuk memastikan total 100%
          if (totalPercentage > 100) {
            const diff = totalPercentage - 100;
            // Kurangi dari yang terbesar
            if (positivePercentage >= negativePercentage && positivePercentage >= neutralPercentage) {
              positivePercentage -= diff;
            } else if (negativePercentage >= positivePercentage && negativePercentage >= neutralPercentage) {
              negativePercentage -= diff;
            } else {
              neutralPercentage -= diff;
            }
          } else if (totalPercentage < 100) {
            const diff = 100 - totalPercentage;
            // Tambahkan ke yang terbesar
            if (positivePercentage >= negativePercentage && positivePercentage >= neutralPercentage) {
              positivePercentage += diff;
            } else if (negativePercentage >= positivePercentage && negativePercentage >= neutralPercentage) {
              negativePercentage += diff;
            } else {
              neutralPercentage += diff;
            }
          }
          
          console.log(`  - Persentase setelah koreksi: positif=${positivePercentage}%, negatif=${negativePercentage}%, netral=${neutralPercentage}%`);
          
          // Perbarui database hanya jika ada perubahan
          if (
            record.positivePercentage !== positivePercentage ||
            record.negativePercentage !== negativePercentage || 
            record.neutralPercentage !== neutralPercentage
          ) {
            updateCount++;
            return db.update(surveyDashboardSummary)
              .set({
                positivePercentage,
                negativePercentage,
                neutralPercentage,
                updatedAt: new Date()
              })
              .where(({ id: recordId }) => recordId.equals(id));
          }
        }
        
        return null;
      });
      
      // Jalankan semua promise update
      await Promise.all(updatePromises.filter(p => p !== null));
    }
    
    console.log(`✅ Perbaikan persentase selesai! ${updateCount} record diperbarui.`);
    
    // Verifikasi total persentase setelah update
    const verifyRecords = await db
      .select({
        id: surveyDashboardSummary.id,
        wordInsight: surveyDashboardSummary.wordInsight,
        totalPercentage: sql\`\${surveyDashboardSummary.positivePercentage} + \${surveyDashboardSummary.negativePercentage} + \${surveyDashboardSummary.neutralPercentage}\`
      })
      .from(surveyDashboardSummary)
      .where(sql\`\${surveyDashboardSummary.positivePercentage} + \${surveyDashboardSummary.negativePercentage} + \${surveyDashboardSummary.neutralPercentage} != 100\`);
    
    if (verifyRecords.length > 0) {
      console.log(`⚠️ Masih ada ${verifyRecords.length} record dengan total persentase tidak sama dengan 100%:`);
      verifyRecords.forEach(record => {
        console.log(`  - "${record.wordInsight}" (ID: ${record.id}): total persentase = ${record.totalPercentage}%`);
      });
    } else {
      console.log("✅ Semua record sekarang memiliki total persentase 100%.");
    }
    
  } catch (error) {
    console.error("❌ Terjadi error saat perbaikan persentase:", error);
    throw error;
  }
}

// Impor SQL di luar fungsi
import { sql } from "drizzle-orm";

// Jalankan fungsi
fixPercentages()
  .then(() => {
    console.log("🎉 Proses perbaikan persentase berhasil");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Proses perbaikan persentase gagal:", error);
    process.exit(1);
  });