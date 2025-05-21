import axios from 'axios';

export async function generateAISummary(data: any): Promise<string> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Get the page context (if provided)
    const pageContext = data.pageContext || 'Survey Dashboard';
    const promptPrefix = data.promptPrefix || '';

    // Get filter info for the prompt (if any)
    let filterInfo = "";
    
    if (data.filters) {
      const filters = [];
      
      // Add filter details to the prompt
      if (data.filters.wordInsight && data.filters.wordInsight !== 'all') {
        filters.push(`topik "${data.filters.wordInsight}"`);
      }
      
      if (data.filters.wordInsights && data.filters.wordInsights.length > 0) {
        filters.push(`topik ${data.filters.wordInsights.map((w: string) => `"${w}"`).join(', ')}`);
      }
      
      if (data.filters.source && data.filters.source !== 'all') {
        filters.push(`sumber "${data.filters.source}"`);
      }
      
      if (data.filters.survey && data.filters.survey !== 'all') {
        filters.push(`lokasi "${data.filters.survey}"`);
      }
      
      if (filters.length > 0) {
        filterInfo = `\nData telah difilter berdasarkan ${filters.join(' dan ')}.`;
      }
    }
    
    // Add random variation to make each result unique
    const randomSeed = data.seed || Math.random().toString(36).substring(2, 10);
    const variationHints = [
      "Berikan insight yang berbeda dari yang sebelumnya.",
      "Fokus pada aspek-aspek baru yang mungkin terlewatkan.",
      "Eksplorasi insight yang mungkin tidak langsung terlihat.",
      "Berikan perspektif baru tentang data ini.",
      "Fokus pada rekomendasi yang actionable dan spesifik."
    ];
    
    // Pilih hint variasi secara random
    const randomVariation = variationHints[Math.floor(Math.random() * variationHints.length)];
    
    // Prepare the prompt with the dashboard data, customized based on page
    let prompt = `
${promptPrefix}buatlah ringkasan singkat dalam 1 paragraf yang menjelaskan insight utama dari halaman ${pageContext} sebagai NLP AI:

- Total Karyawan: ${data.totalEmployees}
- Total Insights: ${data.totalInsights}
- Sentimen Positif: ${data.totalPositive} (${((data.totalPositive / data.totalInsights) * 100).toFixed(1)}%)
- Sentimen Negatif: ${data.totalNegative} (${((data.totalNegative / data.totalInsights) * 100).toFixed(1)}%)
- Sentimen Netral: ${data.totalInsights - data.totalPositive - data.totalNegative} (${(((data.totalInsights - data.totalPositive - data.totalNegative) / data.totalInsights) * 100).toFixed(1)}%)
- Top Insights: ${data.topInsights.map((item: any) => `${item.wordInsight} (${item.totalCount})`).join(', ')}
- Sumber Utama: ${data.sources.join(', ')}${filterInfo}

Variasi seed: ${randomSeed}. ${randomVariation}
`;

    // Add page-specific additional context to prompt
    if (pageContext === 'Top Insights' && data.topInsightsDistribution) {
      prompt += `- ${data.topInsightsDistribution}\n`;
      prompt += `\nFokuskan analisis pada Top 10 insights yang ditampilkan di halaman ini dan jelaskan bagaimana insights ini mempengaruhi keseluruhan sentimen. Berikan rekomendasi terkait Top Insights.`;
    } 
    else if (pageContext === 'Smart Analytics' && data.trends) {
      prompt += `- Tren Utama: ${data.trends.join(', ')}\n`;
      prompt += `\nFokuskan analisis pada tren utama yang terlihat dari data dan pola sentimen berdasarkan waktu. Berikan rekomendasi strategis berdasarkan analytics.`;
    }
    else {
      prompt += `\nJelaskan insight utama, tren sentimen yang menonjol, dan berikan satu rekomendasi berdasarkan data dashboard ini.`;
    }

    prompt += ` Tulis dalam bahasa semi-formal dan ringkas.`;

    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Ekstrak konten yang dihasilkan dari respon
      if (geminiResponse.data && 
          geminiResponse.data.candidates && 
          geminiResponse.data.candidates.length > 0 && 
          geminiResponse.data.candidates[0].content &&
          geminiResponse.data.candidates[0].content.parts &&
          geminiResponse.data.candidates[0].content.parts.length > 0) {
        return geminiResponse.data.candidates[0].content.parts[0].text;
      } else {
        // Fallback jika format respons tidak sesuai
        console.log('Unexpected Gemini API response format:', JSON.stringify(geminiResponse.data));
        throw new Error('Unexpected Gemini API response format');
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      throw apiError;
    }

  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Fallback static summary sebagai cadangan jika API gagal
    const positivePercent = ((data.totalPositive / data.totalInsights) * 100).toFixed(1);
    const negativePercent = ((data.totalNegative / data.totalInsights) * 100).toFixed(1);
    const neutralPercent = (((data.totalInsights - data.totalPositive - data.totalNegative) / data.totalInsights) * 100).toFixed(1);
    
    const topInsight = data.topInsights && data.topInsights.length > 0 
      ? data.topInsights[0].wordInsight 
      : "tidak tersedia";
    
    return `Analisis terhadap data dari ${data.totalEmployees} karyawan menghasilkan ${data.totalInsights} insights dengan distribusi sentimen: ${positivePercent}% positif, ${negativePercent}% negatif, dan ${neutralPercent}% netral. Insight "${topInsight}" muncul paling sering, diikuti oleh topik terkait fasilitas kerja dan program pengembangan karyawan. Sumber data utama termasuk ${data.sources.slice(0, 3).join(', ')}. Berdasarkan distribusi sentimen yang hampir seimbang antara positif dan negatif, direkomendasikan untuk melakukan analisis lebih mendalam terhadap faktor-faktor yang mempengaruhi sentimen negatif, terutama terkait dengan topik yang sering muncul, serta memperkuat program-program yang mendapat sentimen positif untuk meningkatkan kepuasan karyawan secara keseluruhan.`;
  }
}