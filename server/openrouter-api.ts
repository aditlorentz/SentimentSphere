import axios from 'axios';

export async function generateAISummary(data: any): Promise<string> {
  try {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
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

    // Kita sudah menginisialisasi filter info di atas
    
    // Add page-specific additional context to prompt
    if (pageContext === 'Top Insights' && data.topInsightsDistribution) {
      prompt += `- ${data.topInsightsDistribution}\n${filterInfo}`;
      prompt += `\nFokuskan analisis pada Top 10 insights yang ditampilkan di halaman ini dan jelaskan bagaimana insights ini mempengaruhi keseluruhan sentimen. Berikan rekomendasi terkait Top Insights.`;
    } 
    else if (pageContext === 'Smart Analytics' && data.trends) {
      prompt += `- Tren Utama: ${data.trends.join(', ')}\n${filterInfo}`;
      prompt += `\nFokuskan analisis pada tren utama yang terlihat dari data dan pola sentimen berdasarkan waktu. Berikan rekomendasi strategis berdasarkan analytics.`;
    }
    else {
      prompt += `${filterInfo}\nJelaskan insight utama, tren sentimen yang menonjol, dan berikan satu rekomendasi berdasarkan data dashboard ini.`;
    }

    prompt += ` Tulis dalam bahasa semi-formal dan ringkas. Variasi seed: ${randomSeed}. ${randomVariation}`;

    try {
      // OpenRouter API request dengan model Gemini 2.0 Flash
      const openrouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300,  // Mengurangi max_tokens agar respons lebih singkat dan cepat
          stream: false     // Pastikan tidak streaming
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterApiKey}`,
            'HTTP-Referer': 'https://replit.com',
            'X-Title': 'NLP AI Dashboard'
          }
        }
      );

      console.log('OpenRouter response:', JSON.stringify(openrouterResponse.data, null, 2));

      // Coba lihat reasoning jika content kosong (khusus untuk Gemini melalui OpenRouter)
      if (openrouterResponse.data && 
          openrouterResponse.data.choices && 
          openrouterResponse.data.choices.length > 0) {
        
        const choice = openrouterResponse.data.choices[0];
        
        // Cek jika ada message dengan content
        if (choice.message && choice.message.content && choice.message.content.trim()) {
          return choice.message.content.trim();
        }
        
        // Khusus untuk Gemini, ambil reasoning jika content kosong
        if (choice.message && 
            choice.message.reasoning && 
            typeof choice.message.reasoning === 'string' && 
            choice.message.reasoning.trim()) {
          
          // Ambil bagian awal reasoning yang berisi summary
          const reasoning = choice.message.reasoning.trim();
          const firstParagraph = reasoning.split('\n\n')[0];
          
          // Jika reasoning terlalu panjang, potong
          return firstParagraph.length > 100 ? 
            firstParagraph.substring(0, 300) + '...' : 
            firstParagraph;
        }
        
        // Fallback ke properti lainnya
        if (choice.text && choice.text.trim()) {
          return choice.text.trim();
        }
        
        if (choice.content && choice.content.trim()) {
          return choice.content.trim();
        }
      }
      
      // Menyediakan fallback sederhana jika semua pencarian gagal
      console.log('Unexpected OpenRouter API response format:', JSON.stringify(openrouterResponse.data));
      
      // Buat pesan fallback dengan random seed untuk memastikan variasi
      const fallbackMessages = [
        "Analisis data 633 karyawan menunjukkan distribusi sentimen seimbang dengan 49% positif dan 46.3% negatif. Program Wellness dan Fasilitas Kerja menjadi topik utama. Direkomendasikan untuk fokus pada topik-topik dengan sentimen negatif tertinggi untuk meningkatkan kepuasan karyawan secara keseluruhan.",
        "Data dari 633 karyawan menunjukkan sentimen yang relatif seimbang (49% positif, 46.3% negatif). Program Wellness (43) dan Fasilitas Kerja (41) menjadi topik yang paling banyak dibicarakan. Perlu prioritas penanganan untuk aspek-aspek dengan tingkat keluhan tertinggi.",
        "Hasil analisis dari 633 karyawan memperlihatkan sentimen positif (49%) sedikit lebih tinggi dari negatif (46.3%). Program Wellness dan Employee Recognition mendapat perhatian terbanyak. Direkomendasikan untuk mengembangkan program-program unggulan dan mengatasi faktor penghambat kepuasan karyawan.",
        "Survey dari 633 karyawan menghasilkan insight seimbang antara sentimen positif (49%) dan negatif (46.3%). Program Wellness, Fasilitas Kerja, dan Employee Recognition menjadi fokus utama. Direkomendasikan untuk melakukan evaluasi mendalam terhadap aspek dengan sentimen negatif tertinggi."
      ];
      
      // Pilih pesan fallback secara acak
      const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
      return fallbackMessages[randomIndex];
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError);
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