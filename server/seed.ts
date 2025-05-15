import { db } from "./db";
import { insightsData, InsertInsightData } from "@shared/schema";

// Data contoh untuk ditambahkan ke tabel insights_data
const sampleInsights: Omit<InsertInsightData, 'date'>[] = [
  {
    sourceData: "Bud HC",
    employeeName: "Muhammad Khairi",
    witel: "Kalimantan Barat",
    kota: "Ketapang",
    originalInsight: "Saya ingin memberikan masukan tentang program pelatihan kerja jarak jauh yang diadakan bulan lalu. Materinya bagus, tetapi saya pikir akan lebih baik jika waktu diskusi diperpanjang",
    sentenceInsight: "Saya ingin memberikan masukan tentang program pelatihan kerja jarak jauh yang diadakan bulan lalu.",
    wordInsight: "program",
    sentimen: "netral"
  },
  {
    sourceData: "Bud HC",
    employeeName: "Suryadi Priatna",
    witel: "Sulawesi Selatan",
    kota: "Marus",
    originalInsight: "Berikut adalah tanggapan saya mengenai kebijakan evaluasi kinerja karyawan. Saya sangat senang karena hasil evaluasi menjadi lebih transparan dan adil",
    sentenceInsight: "Berikut adalah tanggapan saya mengenai kebijakan evaluasi kinerja karyawan.",
    wordInsight: "evaluasi",
    sentimen: "positif"
  },
  {
    sourceData: "HR",
    employeeName: "Vina Sari",
    witel: "Jawa Barat",
    kota: "Tambun",
    originalInsight: "Dengan berat hati saya menyampaikan bahwa fasilitas kantor di cabang kami sangat kurang memadai. Meja kerja banyak yang rusak dan koneksi internet sering terputus",
    sentenceInsight: "Dengan berat hati saya menyampaikan bahwa fasilitas kantor di cabang kami sangat kurang memadai.",
    wordInsight: "fasilitas",
    sentimen: "negatif"
  },
  {
    sourceData: "Bud HC",
    employeeName: "Riski Darmawan",
    witel: "Jawa Barat",
    kota: "Bekasi",
    originalInsight: "Berikut adalah tanggapan saya tentang program pengembangan karir. Saya merasa program ini belum sepenuhnya mengakomodasi kebutuhan karyawan di level menengah",
    sentenceInsight: "Berikut adalah tanggapan saya tentang program pengembangan karir.",
    wordInsight: "pengembangan",
    sentimen: "netral"
  },
  {
    sourceData: "IT",
    employeeName: "Laila Sari",
    witel: "Papua Barat",
    kota: "Sorong",
    originalInsight: "Saya ingin menyampaikan apresiasi atas inisiatif perusahaan dalam menerapkan sistem manajemen proyek baru. Sangat membantu efisiensi tim kami",
    sentenceInsight: "Saya ingin menyampaikan apresiasi atas inisiatif perusahaan dalam menerapkan sistem manajemen proyek baru.",
    wordInsight: "manajemen",
    sentimen: "positif"
  },
  {
    sourceData: "Bud HC",
    employeeName: "Joko Anwar",
    witel: "Sumatera Utara",
    kota: "Tebing Tinggi",
    originalInsight: "Saya ingin memberikan kritik terhadap proses administrasi cuti yang terlalu berbelit-belit. Kami harus melalui 5 tahap persetujuan yang sangat tidak efisien",
    sentenceInsight: "Saya ingin memberikan kritik terhadap proses administrasi cuti yang terlalu berbelit-belit.",
    wordInsight: "administrasi",
    sentimen: "negatif"
  },
  {
    sourceData: "Dikleum",
    employeeName: "Gunawan Irawan",
    witel: "Jawa Timur",
    kota: "Surabaya",
    originalInsight: "Dengan ini saya ingin mengemukakan kepada manajemen tentang kebijakan baru terkait jam kerja fleksibel. Menurut saya sangat membantu keseimbangan hidup karyawan",
    sentenceInsight: "Dengan ini saya ingin mengemukakan kepada manajemen tentang kebijakan baru terkait jam kerja fleksibel.",
    wordInsight: "kebijakan",
    sentimen: "positif"
  },
  {
    sourceData: "Dikleum",
    employeeName: "Surya Yudha",
    witel: "Jawa Barat",
    kota: "Bandung",
    originalInsight: "Program pengembangan karir yang ditawarkan sangat membantu saya memahami jalur karir yang bisa saya tempuh di perusahaan ini. Terima kasih atas inisiatifnya",
    sentenceInsight: "Program pengembangan karir yang ditawarkan sangat membantu saya memahami jalur karir yang bisa saya tempuh di perusahaan ini.",
    wordInsight: "program",
    sentimen: "positif"
  },
  {
    sourceData: "Feedback",
    employeeName: "Anita Budiman",
    witel: "DKI Jakarta",
    kota: "Jakarta",
    originalInsight: "Sistem kerja hybrid memberikan fleksibilitas yang baik bagi saya untuk mengatur waktu antara pekerjaan dan keluarga. Produktivitas saya justru meningkat",
    sentenceInsight: "Sistem kerja hybrid memberikan fleksibilitas yang baik bagi saya untuk mengatur waktu antara pekerjaan dan keluarga.",
    wordInsight: "sistem",
    sentimen: "positif"
  },
  {
    sourceData: "Dikleum",
    employeeName: "Mira Nuraini",
    witel: "Jawa Timur",
    kota: "Surabaya",
    originalInsight: "Perlu adanya peningkatan fasilitas kerja di kantor cabang. Komputer yang disediakan sudah ketinggalan spesifikasi dan sering lambat",
    sentenceInsight: "Perlu adanya peningkatan fasilitas kerja di kantor cabang.",
    wordInsight: "fasilitas",
    sentimen: "negatif"
  }
];

// Fungsi untuk menambahkan data ke database
async function seedDatabase() {
  console.log("Menambahkan data contoh ke database...");
  
  try {
    // Menghapus tabel dan membuatnya ulang
    await db.execute(`DROP TABLE IF EXISTS insights_data;`);
    await db.execute(`
      CREATE TABLE insights_data (
        id SERIAL PRIMARY KEY,
        source_data TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        witel TEXT NOT NULL,
        kota TEXT NOT NULL,
        original_insight TEXT NOT NULL,
        sentence_insight TEXT NOT NULL,
        word_insight TEXT NOT NULL,
        sentimen TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Menambahkan data baru dengan tanggal
    const dates = [
      new Date("2024-08-18T10:30:00"),
      new Date("2024-12-01T14:15:00"),
      new Date("2025-03-28T09:45:00"),
      new Date("2025-01-10T16:20:00"),
      new Date("2025-03-19T11:05:00"),
      new Date("2025-02-02T13:40:00"),
      new Date("2025-05-14T08:30:00"),
      new Date("2025-05-14T10:15:00"),
      new Date("2025-05-14T15:20:00"),
      new Date("2025-05-14T17:45:00")
    ];
    
    for (let i = 0; i < sampleInsights.length; i++) {
      const insight = sampleInsights[i];
      await db.insert(insightsData).values({
        ...insight,
        date: dates[i]
      });
    }
    
    console.log(`Berhasil menambahkan ${sampleInsights.length} data ke database.`);
  } catch (error) {
    console.error("Error saat menambahkan data:", error);
  } finally {
    process.exit(0);
  }
}

// Menjalankan fungsi seed
seedDatabase();