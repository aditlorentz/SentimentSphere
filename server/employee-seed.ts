import { db } from "./db";
import { employeeInsights } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

// Fungsi untuk menjalankan skrip SQL
async function runSqlScript() {
  console.log("Menambahkan data employee insights dari SQL file...");
  
  try {
    // Menghapus tabel yang lama jika ada
    await db.execute(`DROP TABLE IF EXISTS insights_data;`);
    
    // Memastikan tabel employee_insights ada
    await db.execute(`
      CREATE TABLE IF NOT EXISTS employee_insights (
        id SERIAL PRIMARY KEY,
        "sourceData" TEXT NOT NULL,
        "employeeName" TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        witel TEXT NOT NULL,
        kota TEXT NOT NULL,
        "originalInsight" TEXT NOT NULL,
        "sentenceInsight" TEXT NOT NULL,
        "wordInsight" TEXT NOT NULL,
        sentimen TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Menghapus data lama jika ada
    await db.execute(`TRUNCATE TABLE employee_insights RESTART IDENTITY CASCADE;`);
    
    // Membaca file SQL
    const sqlFilePath = path.join(process.cwd(), 'attached_assets', 'data.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Memisahkan per statement INSERT
    const insertStatements = sqlContent.split('INSERT INTO employee_insights');
    
    // Mengeksekusi setiap statement INSERT
    for (let i = 1; i < insertStatements.length; i++) {
      const statement = 'INSERT INTO employee_insights' + insertStatements[i];
      // Kirim statement ke database
      await db.execute(statement);
      console.log(`Statement ${i} berhasil dijalankan`);
    }
    
    // Memeriksa jumlah data yang ditambahkan
    const countResult = await db.execute('SELECT COUNT(*) FROM employee_insights');
    console.log(`Berhasil menambahkan ${countResult.rows[0].count} data ke tabel employee_insights.`);
    
  } catch (error) {
    console.error("Error saat menjalankan skrip SQL:", error);
  } finally {
    process.exit(0);
  }
}

// Menjalankan fungsi import data
runSqlScript();