import { db } from "./db";
import { employeeInsights, InsertEmployeeInsight } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { sql } from "drizzle-orm";

// Fungsi untuk mengimpor data dari JSON dengan batch insert
async function batchImportData() {
  console.log("Mengimpor data dari file JSON ke tabel employee_insights dengan batch insert...");
  
  try {
    // Membaca file JSON
    const jsonFilePath = path.join(process.cwd(), 'attached_assets', 'database.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData = JSON.parse(jsonData);
    
    console.log(`Total data yang akan diimpor: ${employeeData.length}`);
    
    // Mendapatkan data yang sudah ada di database
    const existingData = await db.select({ count: sql`COUNT(*)` }).from(employeeInsights);
    const existingCount = parseInt(String(existingData[0].count));
    console.log(`Data yang sudah ada di database: ${existingCount}`);
    
    // Mengimpor data ke database dalam batch
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 100; // Ukuran batch yang lebih besar
    
    // Mendapatkan daftar data yang sudah ada untuk pengecekan duplikat
    // Kita akan menggunakan kombinasi sourceData, employeeName, dan date sebagai kunci unik
    const existingKeys = new Set();
    const existingRecords = await db.select({
      sourceData: employeeInsights.sourceData,
      employeeName: employeeInsights.employeeName,
      date: employeeInsights.date
    }).from(employeeInsights);
    
    for (const record of existingRecords) {
      // Format tanggal ke string YYYY-MM-DD untuk konsistensi
      const dateStr = record.date instanceof Date ? 
        record.date.toISOString().split('T')[0] : 
        (new Date(record.date as any)).toISOString().split('T')[0];
      
      const key = `${record.sourceData}|${record.employeeName}|${dateStr}`;
      existingKeys.add(key);
    }
    
    console.log(`Jumlah data unik terdeteksi: ${existingKeys.size}`);
    
    // Membagi data menjadi batch-batch
    for (let i = 0; i < employeeData.length; i += batchSize) {
      const batch = employeeData.slice(i, i + batchSize);
      console.log(`Memproses batch ${Math.floor(i / batchSize) + 1} dari ${Math.ceil(employeeData.length / batchSize)}...`);
      
      // Memfilter data yang sudah ada
      const newData: InsertEmployeeInsight[] = [];
      
      for (const employee of batch) {
        try {
          // Format tanggal untuk pengecekan
          const dateStr = employee.date.split('T')[0];
          const key = `${employee.sourceData}|${employee.employeeName}|${dateStr}`;
          
          // Cek apakah data sudah ada
          if (!existingKeys.has(key)) {
            const dateObject = new Date(employee.date);
            
            // Pastikan panjang original insight tidak melebihi 1000 karakter
            let originalInsight = employee.originalInsight;
            if (originalInsight.length > 1000) {
              originalInsight = originalInsight.substring(0, 997) + '...';
            }
            
            newData.push({
              sourceData: employee.sourceData,
              employeeName: employee.employeeName,
              date: dateObject,
              witel: employee.witel,
              kota: employee.kota,
              originalInsight: originalInsight,
              sentenceInsight: employee.sentenceInsight,
              wordInsight: employee.wordInsight,
              sentimen: employee.sentimen
            });
            
            // Tambahkan key ke set untuk menghindari duplikasi dalam batch yang sama
            existingKeys.add(key);
          }
        } catch (err) {
          console.error(`Error saat memproses data untuk ${employee.employeeName}:`, err);
          errorCount++;
        }
      }
      
      // Batch insert untuk data baru
      if (newData.length > 0) {
        try {
          await db.insert(employeeInsights).values(newData);
          successCount += newData.length;
          console.log(`Berhasil menambahkan ${newData.length} data dalam batch ini.`);
        } catch (error) {
          console.error("Error saat melakukan batch insert:", error);
          errorCount += newData.length;
        }
      } else {
        console.log("Tidak ada data baru untuk diimpor dalam batch ini.");
      }
    }
    
    // Memeriksa jumlah data yang ditambahkan
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(employeeInsights);
    const finalCount = parseInt(String(countResult[0].count));
    console.log(`Total data setelah impor: ${finalCount}`);
    console.log(`Data baru yang berhasil ditambahkan: ${successCount}, Gagal: ${errorCount}`);
    console.log(`Total pertambahan data: ${finalCount - existingCount}`);
    
  } catch (error) {
    console.error("Error saat mengimpor data JSON:", error);
  } finally {
    process.exit(0);
  }
}

// Menjalankan fungsi import data
batchImportData();