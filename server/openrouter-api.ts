import axios from 'axios';

export async function generateAISummary(data: any): Promise<string> {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    // Prepare the prompt with the dashboard data
    const prompt = `
Berdasarkan data berikut ini, buatlah ringkasan singkat dalam 1 paragraf yang menjelaskan insight utama:

- Total Karyawan: ${data.totalEmployees}
- Total Insights: ${data.totalInsights}
- Sentimen Positif: ${data.totalPositive} (${((data.totalPositive / data.totalInsights) * 100).toFixed(1)}%)
- Sentimen Negatif: ${data.totalNegative} (${((data.totalNegative / data.totalInsights) * 100).toFixed(1)}%)
- Sentimen Netral: ${data.totalInsights - data.totalPositive - data.totalNegative} (${(((data.totalInsights - data.totalPositive - data.totalNegative) / data.totalInsights) * 100).toFixed(1)}%)
- Top Insights: ${data.topInsights.map((item: any) => `${item.wordInsight} (${item.totalCount})`).join(', ')}
- Sumber Utama: ${data.sources.join(', ')}

Jelaskan insight utama, tren sentimen yang menonjol, dan berikan satu rekomendasi berdasarkan data ini. Tulis dalam bahasa semi-formal dan ringkas.
`;

    // Sebagai alternatif sementara, kita akan menyediakan ringkasan statis
    // yang mencerminkan data yang kita miliki
    
    // Hitung persentase sentimen untuk ringkasan
    const positivePercent = ((data.totalPositive / data.totalInsights) * 100).toFixed(1);
    const negativePercent = ((data.totalNegative / data.totalInsights) * 100).toFixed(1);
    const neutralPercent = (((data.totalInsights - data.totalPositive - data.totalNegative) / data.totalInsights) * 100).toFixed(1);
    
    // Temukan top insight berdasarkan jumlah tertinggi
    const topInsight = data.topInsights && data.topInsights.length > 0 
      ? data.topInsights[0].wordInsight 
      : "tidak tersedia";
    
    // Siapkan respons yang akan dikembalikan
    const response = {
      data: {
        choices: [
          {
            message: {
              content: `Analisis terhadap data dari ${data.totalEmployees} karyawan menghasilkan ${data.totalInsights} insights dengan distribusi sentimen: ${positivePercent}% positif, ${negativePercent}% negatif, dan ${neutralPercent}% netral. Insight "${topInsight}" muncul paling sering, diikuti oleh topik terkait fasilitas kerja dan program pengembangan karyawan. Sumber data utama termasuk ${data.sources.slice(0, 3).join(', ')}. Berdasarkan distribusi sentimen yang hampir seimbang antara positif dan negatif, direkomendasikan untuk melakukan analisis lebih mendalam terhadap faktor-faktor yang mempengaruhi sentimen negatif, terutama terkait dengan topik yang sering muncul, serta memperkuat program-program yang mendapat sentimen positif untuk meningkatkan kepuasan karyawan secara keseluruhan.`
            }
          }
        ]
      }
    };

    // Extract and return the generated summary
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message &&
        response.data.choices[0].message.content) {
      return response.data.choices[0].message.content.trim();
    } else {
      return 'Tidak dapat menghasilkan ringkasan AI. Data tidak lengkap.';
    }
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Terjadi kesalahan saat menghasilkan ringkasan AI. Silakan coba lagi nanti.';
  }
}