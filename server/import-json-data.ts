import { db } from "./db";
import { employeeInsights, InsertEmployeeInsight } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

// Fungsi untuk mengimpor data dari JSON dengan batches
async function importJsonData() {
  console.log("Mengimpor data dari file JSON ke tabel employee_insights...");
  
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
    const batchSize = 50; // Mengimpor 50 data sekaligus
    
    // Membagi data menjadi batch-batch
    for (let i = 0; i < employeeData.length; i += batchSize) {
      const batch = employeeData.slice(i, i + batchSize);
      console.log(`Mengimpor batch ${Math.floor(i / batchSize) + 1} dari ${Math.ceil(employeeData.length / batchSize)}...`);
      
      // Memeriksa duplikasi data berdasarkan kombinasi unik
      for (const employee of batch) {
        try {
          // Mencari data yang mungkin duplikat menggunakan Drizzle ORM
          const checkDuplicate = await db.select({ count: sql`COUNT(*)` })
            .from(employeeInsights)
            .where(
              and(
                eq(employeeInsights.sourceData, employee.sourceData),
                eq(employeeInsights.employeeName, employee.employeeName),
                eq(employeeInsights.date, new Date(employee.date)),
                eq(employeeInsights.witel, employee.witel),
                eq(employeeInsights.kota, employee.kota)
              )
            );
          
          const duplicateCount = parseInt(String(checkDuplicate[0].count));
          
          // Jika tidak ada duplikat, tambahkan data
          if (duplicateCount === 0) {
            // Pastikan tanggal dalam format yang benar
            const dateObject = new Date(employee.date);
            
            const insertData: InsertEmployeeInsight = {
              sourceData: employee.sourceData,
              employeeName: employee.employeeName,
              date: dateObject,
              witel: employee.witel,
              kota: employee.kota,
              originalInsight: employee.originalInsight.substring(0, 1000), // Truncate jika terlalu panjang
              sentenceInsight: employee.sentenceInsight,
              wordInsight: employee.wordInsight,
              sentimen: employee.sentimen
            };
            
            await db.insert(employeeInsights).values(insertData);
            successCount++;
          } else {
            console.log(`Data duplikat ditemukan untuk ${employee.employeeName}, dilewati.`);
          }
        } catch (err) {
          console.error(`Error saat menambahkan data untuk ${employee.employeeName}:`, err);
          errorCount++;
        }
      }
      
      // Tunggu sebentar setelah setiap batch untuk menghindari overload
      await new Promise(resolve => setTimeout(resolve, 100));
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
importJsonData();