import React, { useMemo, useState } from "react";
import Header from "@/components/layout/header";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import { SentimentCategoryCard } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InsightData } from "@/components/cards/insight-card";
import { CategoryInsights, SurveyDashboardSummary } from "@shared/schema";
import { DateRange } from "react-day-picker";

// Fungsi untuk menghasilkan teks AI conclusion berdasarkan statistik
function generateAIConclusionText(stats: any): string {
  if (!stats) {
    return "Belum ada data yang tersedia untuk dianalisis.";
  }

  const positivePercent = Math.round((stats.positiveCount / stats.totalInsights) * 100);
  const negativePercent = Math.round((stats.negativeCount / stats.totalInsights) * 100);
  const neutralPercent = Math.round((stats.neutralCount / stats.totalInsights) * 100);

  // Identifikasi sentiment dominan
  let dominantSentiment = "netral";
  let dominantPercent = neutralPercent;
  
  if (positivePercent > negativePercent && positivePercent > neutralPercent) {
    dominantSentiment = "positif";
    dominantPercent = positivePercent;
  } else if (negativePercent > positivePercent && negativePercent > neutralPercent) {
    dominantSentiment = "negatif";
    dominantPercent = negativePercent;
  }

  // Top sources
  const topSources = stats.bySource.sort((a: any, b: any) => b.count - a.count).slice(0, 3);
  const topSourcesText = topSources.map((s: any) => `${s.source} (${s.count})`).join(", ");

  // Top words
  const topWords = stats.byWord.sort((a: any, b: any) => b.count - a.count).slice(0, 5);
  const topWordsText = topWords.map((w: any) => `${w.word}`).join(", ");

  return `
    Dari total ${stats.totalInsights} insight karyawan, sentimen yang dominan adalah ${dominantSentiment} (${dominantPercent}%). 
    Terdapat ${stats.positiveCount} insight positif (${positivePercent}%), ${stats.negativeCount} insight negatif (${negativePercent}%), dan ${stats.neutralCount} insight netral (${neutralPercent}%).
    
    Sumber data terbanyak berasal dari ${topSourcesText}.
    
    Kata kunci yang paling sering muncul: ${topWordsText}.
    
    Hasil analisis ini menunjukkan bahwa sentimen karyawan secara umum ${dominantSentiment}, dengan fokus pada topik-topik yang perlu mendapat perhatian segera.
  `;
}

export default function SurveyDashboard() {
  const queryClient = useQueryClient();
  
  // Filter state
  const [source, setSource] = useState<string>("all");
  const [survey, setSurvey] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [wordInsight, setWordInsight] = useState<string>("all");
  const [sentiment, setSentiment] = useState<string>("all");
  
  // Fetch insights
  const { data: insights, isLoading: insightsLoading } = useQuery<CategoryInsights>({
    queryKey: ['/api/insights'],
  });
  
  // Fetch database stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalInsights: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    bySource: { source: string; count: number }[];
    byWitel: { witel: string; count: number }[];
    byWord: { word: string; count: number }[];
  }>({
    queryKey: ['/api/postgres/stats'],
  });
  
  // Function to build query string based on filters
  const buildQueryString = () => {
    // Tidak perlu pagination karena kita akan menampilkan semua data
    let queryString = `/api/survey-dashboard/summary?page=1&limit=1000`;
    
    if (source && source !== 'all') {
      queryString += `&source=${encodeURIComponent(source)}`;
    }
    
    if (survey && survey !== 'all') {
      queryString += `&survey=${encodeURIComponent(survey)}`;
    }
    
    if (wordInsight && wordInsight !== 'all') {
      queryString += `&wordInsight=${encodeURIComponent(wordInsight)}`;
    }
    
    if (sentiment && sentiment !== 'all') {
      queryString += `&sentiment=${encodeURIComponent(sentiment)}`;
    }
    
    if (dateRange && dateRange.from) {
      queryString += `&startDate=${dateRange.from.toISOString()}`;
      
      if (dateRange.to) {
        queryString += `&endDate=${dateRange.to.toISOString()}`;
      } else {
        queryString += `&endDate=${new Date().toISOString()}`;
      }
    }
    
    return queryString;
  };
  
  // Fetch survey dashboard summary data langsung (bukan infinite)
  const { 
    data: summaryData, 
    isLoading: summaryLoading,
    refetch 
  } = useQuery<{
    data: SurveyDashboardSummary[];
    total: string;
  }>({
    queryKey: ['/api/survey-dashboard/summary', { source, survey, dateRange, wordInsight, sentiment }],
    queryFn: async () => {
      const response = await fetch(buildQueryString());
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
  });
  
  // Convert survey dashboard summary data to sentiment categories
  const categories = useMemo(() => {
    const result = {
      positive: [] as InsightData[],
      negative: [] as InsightData[],
      neutral: [] as InsightData[],
    };
    
    if (!summaryData?.data) return result;
    
    // Process all data at once
    summaryData.data.forEach((item: SurveyDashboardSummary) => {
      const posPercent = item.positivePercentage || 0;
      const negPercent = item.negativePercentage || 0;
      const neutPercent = item.neutralPercentage || 0;
      
      // Find the highest percentage
      const maxPercent = Math.max(posPercent, negPercent, neutPercent);
      
      // Create insight object
      const insight: InsightData = {
        id: item.id,
        title: item.wordInsight,
        positivePercentage: posPercent,
        negativePercentage: negPercent,
        neutralPercentage: neutPercent,
        views: item.totalCount,
        comments: 0
      };
      
      // Apply wordInsight filter
      if (wordInsight !== "all" && item.wordInsight !== wordInsight) {
        return; // Skip this item if it doesn't match the wordInsight filter
      }
      
      // Apply sentiment filter
      const dominantSentiment = (() => {
        if (maxPercent === posPercent && maxPercent > 0) return "positif";
        if (maxPercent === negPercent && maxPercent > 0) return "negatif";
        if (maxPercent === neutPercent && maxPercent > 0) return "netral";
        return "unknown";
      })();
      
      if (sentiment !== "all" && dominantSentiment !== sentiment) {
        return; // Skip this item if it doesn't match the sentiment filter
      }
      
      // Add to appropriate category based on highest percentage
      if (maxPercent === posPercent && maxPercent > 0) {
        result.positive.push(insight);
      } else if (maxPercent === negPercent && maxPercent > 0) {
        result.negative.push(insight);
      } else if (maxPercent === neutPercent && maxPercent > 0) {
        result.neutral.push(insight);
      }
    });
    
    return result;
  }, [summaryData, wordInsight, sentiment]);
  
  // Handler for removing insights
  const handleRemoveInsight = (id: number) => {
    console.log(`Removing insight with ID: ${id}`);
    // In a real app, we would call an API and then invalidate the query
  };
  
  // Handler for pinning insights to My Insights
  const handlePinInsight = (insight: InsightData) => {
    // Get existing pinned insights from localStorage
    const existingPinnedString = localStorage.getItem('pinnedInsights');
    let pinnedInsights: InsightData[] = [];
    
    if (existingPinnedString) {
      try {
        pinnedInsights = JSON.parse(existingPinnedString);
      } catch (e) {
        console.error('Error parsing pinned insights from localStorage', e);
      }
    }
    
    // Check if insight is already pinned
    const isPinned = pinnedInsights.some(item => item.id === insight.id);
    
    if (isPinned) {
      // If already pinned, remove it
      pinnedInsights = pinnedInsights.filter(item => item.id !== insight.id);
    } else {
      // Otherwise, add it to pinned insights
      pinnedInsights.push(insight);
    }
    
    // Save back to localStorage
    localStorage.setItem('pinnedInsights', JSON.stringify(pinnedInsights));
  };
  
  // Overall loading state
  const isLoading = insightsLoading || statsLoading || summaryLoading;
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-x-hidden">
        <Header title="Survey Dashboard" />
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-[12px] h-24 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[12px] h-96 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Filter handlers
  const handleSourceChange = (value: string) => {
    setSource(value);
  };
  
  const handleSurveyChange = (value: string) => {
    setSurvey(value);
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };
  
  const handleWordInsightChange = (value: string) => {
    setWordInsight(value);
  };
  
  const handleSentimentChange = (value: string) => {
    setSentiment(value);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSource("all");
    setSurvey("all");
    setDateRange(undefined);
    setWordInsight("all");
    setSentiment("all");
  };
  
  // Informasi jumlah total data
  const totalData = parseInt(summaryData?.total || "0");
  
  return (
    <div className="flex-1 overflow-x-hidden">
      <Header 
        title="Survey Dashboard" 
        totalInsights={stats?.totalInsights || 0}
        showFilters={true}
        // Sembunyikan filter Source, Survey, dan Date di halaman survey dashboard
        showSourceFilter={false}
        showSurveyFilter={false}
        showDateFilter={false}
        onSourceChange={handleSourceChange}
        onSurveyChange={handleSurveyChange}
        onDateRangeChange={handleDateRangeChange}
        onWordInsightChange={handleWordInsightChange}
        onSentimentChange={handleSentimentChange}
        onResetFilters={handleResetFilters}
        sourceValue={source}
        surveyValue={survey}
        dateRangeValue={dateRange}
        wordInsightValue={wordInsight}
        sentimentValue={sentiment}
        // Pass source options based on stats data
        sourceOptions={stats?.bySource.map(s => ({ 
          label: `${s.source} (${s.count})`, 
          value: s.source 
        })) || []}
        // Pass survey options based on stats data
        surveyOptions={stats?.byWitel.map(w => ({ 
          label: `${w.witel} (${w.count})`, 
          value: w.witel 
        })) || []}
        // Pass word insight options based on stats data
        wordInsightOptions={stats?.byWord.map(w => ({ 
          label: `${w.word} (${w.count})`, 
          value: w.word 
        })) || []}
      />
      
      <div className="p-6">
        <AIInsightConclusion />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SentimentCategoryCard
            title="Netral"
            badge={categories.neutral.length}
            type="neutral"
            insights={categories.neutral}
            onRemoveInsight={handleRemoveInsight}
            onPinInsight={handlePinInsight}
          />
          
          <SentimentCategoryCard
            title="Negatif"
            badge={categories.negative.length}
            type="negative"
            insights={categories.negative}
            onRemoveInsight={handleRemoveInsight}
            onPinInsight={handlePinInsight}
          />
          
          <SentimentCategoryCard
            title="Positif"
            badge={categories.positive.length}
            type="positive"
            insights={categories.positive}
            onRemoveInsight={handleRemoveInsight}
            onPinInsight={handlePinInsight}
          />
        </div>
        
        {/* Informasi jumlah data */}
        <div className="text-center text-gray-500 text-sm mt-4 mb-6">
          Menampilkan semua {totalData} data dari database
        </div>
        
        {/* Show chat bot */}
        <div className="mt-8">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}