import { db } from "./db";
import { employeeInsights, InsertEmployeeInsight } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

// Fungsi untuk mengimpor data dari JSON
async function importJsonData() {
  console.log("Mengimpor data dari file JSON ke tabel employee_insights...");
  
  try {
    // Menghapus tabel yang lama jika ada
    await db.execute(`DROP TABLE IF EXISTS insights_data;`);
    
    // Menghapus data lama di tabel employee_insights jika ada
    await db.execute(`TRUNCATE TABLE employee_insights RESTART IDENTITY CASCADE;`);
    
    // Membaca file JSON
    const jsonFilePath = path.join(process.cwd(), 'attached_assets', 'database.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData = JSON.parse(jsonData);
    
    // Mengimpor data ke database
    let successCount = 0;
    let errorCount = 0;
    
    for (const employee of employeeData) {
      try {
        // Pastikan tanggal dalam format yang benar
        const dateObject = new Date(employee.date);
        
        const insertData: InsertEmployeeInsight = {
          sourceData: employee.sourceData,
          employeeName: employee.employeeName,
          date: dateObject,
          witel: employee.witel,
          kota: employee.kota,
          originalInsight: employee.originalInsight,
          sentenceInsight: employee.sentenceInsight,
          wordInsight: employee.wordInsight,
          sentimen: employee.sentimen
        };
        
        await db.insert(employeeInsights).values(insertData);
        successCount++;
      } catch (err) {
        console.error(`Error saat menambahkan data untuk ${employee.employeeName}:`, err);
        errorCount++;
      }
    }
    
    // Memeriksa jumlah data yang ditambahkan
    const countResult = await db.execute('SELECT COUNT(*) FROM employee_insights');
    console.log(`Berhasil menambahkan ${countResult.rows[0].count} data ke tabel employee_insights.`);
    console.log(`Berhasil: ${successCount}, Gagal: ${errorCount}`);
    
  } catch (error) {
    console.error("Error saat mengimpor data JSON:", error);
  } finally {
    process.exit(0);
  }
}

// Menjalankan fungsi import data
importJsonData();