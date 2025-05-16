import { db } from "./db";
import { mapGeoData, employeeInsights } from "@shared/schema";
import { eq } from "drizzle-orm";
import { pool } from "./db";

// Pemetaan dari Witel ke RegionId dan RegionName
const witelToRegionMapping: Record<string, { regionId: string, regionName: string, latitude: string, longitude: string }> = {
  "JAKARTA": { regionId: "ID-JK", regionName: "Jakarta", latitude: "-6.2", longitude: "106.8" },
  "JAWA BARAT": { regionId: "ID-JB", regionName: "West Java", latitude: "-6.9", longitude: "107.6" },
  "JAWA TIMUR": { regionId: "ID-JI", regionName: "East Java", latitude: "-7.5", longitude: "112.5" },
  "JAWA TENGAH": { regionId: "ID-JT", regionName: "Central Java", latitude: "-7.0", longitude: "110.4" },
  "SULAWESI SELATAN": { regionId: "ID-SN", regionName: "South Sulawesi", latitude: "-5.1", longitude: "119.4" },
  "BANTEN": { regionId: "ID-BT", regionName: "Banten", latitude: "-6.1", longitude: "106.1" },
  "SUMATERA UTARA": { regionId: "ID-SU", regionName: "North Sumatra", latitude: "3.6", longitude: "98.7" },
  "KALIMANTAN TIMUR": { regionId: "ID-KT", regionName: "East Kalimantan", latitude: "-0.5", longitude: "117.1" }
};

/**
 * Script untuk mengisi tabel map_geo_data berdasarkan data dari employee_insights
 * 
 * Proses:
 * 1. Hapus semua data yang ada di tabel map_geo_data
 * 2. Buat aggregasi data berdasarkan witel dari tabel employee_insights
 * 3. Petakan witel ke region dan gabungkan data yang memiliki region yang sama
 * 4. Hitung total data, positif, negatif, netral untuk tiap region
 * 5. Tentukan sentimen dominan untuk tiap region
 * 6. Simpan data ke tabel map_geo_data
 */
async function migrateMapGeoData() {
  try {
    console.log("Memulai migrasi data ke map_geo_data...");
    
    // 1. Hapus data yang ada di tabel map_geo_data menggunakan raw SQL query
    console.log("Menghapus data lama dari tabel map_geo_data...");
    await pool.query("DELETE FROM map_geo_data");
    console.log("Data lama berhasil dihapus");
    
    // 2. Ambil semua data witel dan sentiment dari employee_insights menggunakan raw SQL query
    console.log("Mengambil data dari employee_insights...");
    const result = await pool.query(`
      SELECT witel, sentimen 
      FROM employee_insights
    `);
    const witelData = result.rows;
    
    // 3. Buat aggregasi data berdasarkan witel
    const witelAggregation: Record<string, { 
      totalCount: number, 
      positiveCount: number, 
      negativeCount: number, 
      neutralCount: number,
      witel: string
    }> = {};
    
    // Hitung total dan breakdown sentimen untuk setiap witel
    witelData.forEach(record => {
      const witel = record.witel.toUpperCase(); // Normalisasi menjadi uppercase
      
      // Inisialisasi jika belum ada
      if (!witelAggregation[witel]) {
        witelAggregation[witel] = {
          totalCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0,
          witel: witel
        };
      }
      
      // Increment total count
      witelAggregation[witel].totalCount++;
      
      // Increment sentimen count berdasarkan jenis
      const sentimen = record.sentimen.toLowerCase();
      if (sentimen === 'positif') {
        witelAggregation[witel].positiveCount++;
      } else if (sentimen === 'negatif') {
        witelAggregation[witel].negativeCount++;
      } else {
        witelAggregation[witel].neutralCount++;
      }
    });
    
    // 4. Petakan witel ke region dan gabungkan data
    const regionAggregation: Record<string, {
      regionId: string,
      regionName: string,
      latitude: string,
      longitude: string,
      witelList: string[],
      totalCount: number,
      positiveCount: number,
      negativeCount: number,
      neutralCount: number
    }> = {};
    
    // Kelompokkan witel berdasarkan regionId
    for (const [witel, counts] of Object.entries(witelAggregation)) {
      // Default region information untuk witel yang tidak ada di mapping
      let regionInfo = { 
        regionId: `ID-OTHER-${witel.slice(0, 3)}`, 
        regionName: `Other: ${witel}`, 
        latitude: "0", 
        longitude: "0" 
      };
      
      // Coba cari region berdasarkan witel
      for (const [mapWitel, mapInfo] of Object.entries(witelToRegionMapping)) {
        if (witel.includes(mapWitel) || mapWitel.includes(witel)) {
          regionInfo = mapInfo;
          break;
        }
      }
      
      // Inisialisasi region jika belum ada
      if (!regionAggregation[regionInfo.regionId]) {
        regionAggregation[regionInfo.regionId] = {
          regionId: regionInfo.regionId,
          regionName: regionInfo.regionName,
          latitude: regionInfo.latitude,
          longitude: regionInfo.longitude,
          witelList: [],
          totalCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0
        };
      }
      
      // Tambahkan witel ke daftar witel region
      regionAggregation[regionInfo.regionId].witelList.push(witel);
      
      // Tambahkan statistik dari witel ke region
      regionAggregation[regionInfo.regionId].totalCount += counts.totalCount;
      regionAggregation[regionInfo.regionId].positiveCount += counts.positiveCount;
      regionAggregation[regionInfo.regionId].negativeCount += counts.negativeCount;
      regionAggregation[regionInfo.regionId].neutralCount += counts.neutralCount;
    }
    
    // 5. Buat data untuk dimasukkan ke tabel
    const insertValues = [];
    
    for (const region of Object.values(regionAggregation)) {
      // Tentukan sentimen dominan
      let dominantSentiment = "neutral";
      if (region.positiveCount > region.negativeCount && region.positiveCount > region.neutralCount) {
        dominantSentiment = "positive";
      } else if (region.negativeCount > region.positiveCount && region.negativeCount > region.neutralCount) {
        dominantSentiment = "negative";
      }
      
      // Gabungkan daftar witel menjadi string dengan separator koma
      const witelString = region.witelList.join(", ");
      
      // Tambahkan data untuk region ini
      insertValues.push(`(
        '${region.regionId}', 
        '${region.regionName}', 
        '${witelString}',
        '${region.latitude}',
        '${region.longitude}',
        ${region.totalCount},
        ${region.positiveCount},
        ${region.negativeCount},
        ${region.neutralCount},
        '${dominantSentiment}'
      )`);
    }
    
    // 6. Insert data ke database menggunakan raw SQL query
    if (insertValues.length > 0) {
      const insertSQL = `
        INSERT INTO map_geo_data (
          region_id, region_name, witel, latitude, longitude, 
          total_count, positive_count, negative_count, neutral_count, dominant_sentiment
        ) VALUES ${insertValues.join(", ")}
      `;
      
      console.log(`Menyimpan ${insertValues.length} baris data ke tabel map_geo_data...`);
      await pool.query(insertSQL);
      console.log("Data berhasil disimpan");
    } else {
      console.log("Tidak ada data untuk disimpan");
    }
    
    // 7. Tampilkan data yang sudah tersimpan
    const savedDataResult = await pool.query("SELECT * FROM map_geo_data");
    const savedData = savedDataResult.rows;
    
    console.log(`Total ${savedData.length} baris data tersimpan di map_geo_data`);
    savedData.forEach(record => {
      console.log(`${record.region_name}: Total ${record.total_count}, Dominan: ${record.dominant_sentiment}`);
    });
    
    console.log("Migrasi data ke map_geo_data selesai");
    
  } catch (error) {
    console.error("Error saat migrasi data map_geo_data:", error);
  } finally {
    process.exit(0);
  }
}

// Jalankan migrasi
migrateMapGeoData();