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

    // Call OpenRouter API with Gemini Flash 2.0
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-flash-2:latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://replit.app',
          'X-Title': 'NLP Sentiment Analysis Dashboard',
          'Content-Type': 'application/json'
        }
      }
    );

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