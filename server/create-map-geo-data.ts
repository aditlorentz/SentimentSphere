import { pool } from './db';

// SQL untuk membuat tabel map_geo_data
const createMapGeoDataTableSQL = `
CREATE TABLE IF NOT EXISTS map_geo_data (
  id SERIAL PRIMARY KEY,
  region_id TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  witel TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  positive_count INTEGER NOT NULL DEFAULT 0,
  negative_count INTEGER NOT NULL DEFAULT 0,
  neutral_count INTEGER NOT NULL DEFAULT 0,
  dominant_sentiment TEXT NOT NULL DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function createMapGeoDataTable() {
  try {
    console.log("Membuat tabel map_geo_data...");
    await pool.query(createMapGeoDataTableSQL);
    console.log("Tabel map_geo_data berhasil dibuat!");
  } catch (error) {
    console.error("Error saat membuat tabel map_geo_data:", error);
  } finally {
    process.exit(0);
  }
}

// Jalankan fungsi pembuatan tabel
createMapGeoDataTable();