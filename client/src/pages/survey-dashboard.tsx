import { useEffect, useMemo } from "react";
import Header from "@/components/layout/header";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import { SentimentCategoryCard } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery } from "@tanstack/react-query";
import { InsightData } from "@/components/cards/insight-card";
import { CategoryInsights, SurveyDashboardSummary } from "@shared/schema";

// Fungsi untuk menghasilkan teks AI conclusion berdasarkan statistik
function generateAIConclusionText(stats: any): string {
  if (!stats) {
    return "Menunggu data untuk analisis sentimen...";
  }
  
  return `Berdasarkan analisis sentimen dari ${stats.totalInsights || 0} insight, mayoritas tanggapan bersifat ${
    stats.positiveCount > stats.negativeCount && stats.positiveCount > stats.neutralCount ? 'positif' : 
    stats.negativeCount > stats.positiveCount && stats.negativeCount > stats.neutralCount ? 'negatif' : 'netral'
  } (${
    stats.positiveCount > stats.negativeCount && stats.positiveCount > stats.neutralCount ? stats.positiveCount : 
    stats.negativeCount > stats.positiveCount && stats.negativeCount > stats.neutralCount ? stats.negativeCount : stats.neutralCount || 0
  }) dengan ${stats.positiveCount || 0} positif dan ${stats.negativeCount || 0} negatif. ${
    stats.bySource && stats.bySource.length > 0 
      ? `Sumber data tertinggi dari "${stats.bySource[0]?.source || ''}" (${stats.bySource[0]?.count || 0} insight).` 
      : ''
  } ${
    stats.byWord && stats.byWord.length > 0 
      ? `Kata kunci populer: "${stats.byWord[0]?.word || ''}" (${stats.byWord[0]?.count || 0} kemunculan).`
      : '' 
  } Secara keseluruhan, sentimen karyawan memerlukan perhatian manajemen untuk meningkatkan pengalaman kerja.`;
}

export default function SurveyDashboard() {
  // Fetch insights data from the API
  const { data: insights, isLoading } = useQuery<CategoryInsights>({
    queryKey: ['/api/insights'],
  });
  
  // Fetch database stats
  const { data: stats } = useQuery<{
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
  
  // Fetch survey dashboard summary data
  const { data: summaryData } = useQuery<{
    data: SurveyDashboardSummary[];
    total: number;
  }>({
    queryKey: ['/api/survey-dashboard/summary'],
  });
  
  // Convert survey dashboard summary data to insights format
  const summaryInsights = useMemo(() => {
    if (!summaryData?.data) {
      return {
        positive: [],
        negative: [],
        neutral: []
      } as CategoryInsights;
    }
    
    const positive: InsightData[] = [];
    const negative: InsightData[] = [];
    const neutral: InsightData[] = [];
    
    summaryData.data.forEach(item => {
      // Determine the dominant sentiment based on the highest percentage
      const maxPercentage = Math.max(
        item.positivePercentage || 0,
        item.negativePercentage || 0,
        item.neutralPercentage || 0
      );
      
      // Create insight data object
      const insightData: InsightData = {
        id: item.id,
        title: item.wordInsight,
        positivePercentage: item.positivePercentage || 0,
        negativePercentage: item.negativePercentage || 0,
        neutralPercentage: item.neutralPercentage || 0,
        views: item.totalCount,
        comments: 0
      };
      
      // Add to appropriate category based on dominant sentiment
      if (maxPercentage === item.positivePercentage && maxPercentage > 0) {
        positive.push(insightData);
      } else if (maxPercentage === item.negativePercentage && maxPercentage > 0) {
        negative.push(insightData);
      } else if (maxPercentage === item.neutralPercentage && maxPercentage > 0) {
        neutral.push(insightData);
      }
    });
    
    return {
      positive,
      negative,
      neutral
    } as CategoryInsights;
  }, [summaryData]);

  // Handler for removing insights (would call API in a real app)
  const handleRemoveInsight = (id: number) => {
    console.log(`Removing insight with ID: ${id}`);
    // In a real app, we would call API and then invalidate the query
  };

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

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="Survey Dashboard" />
      
      <div className="p-6">
        <AIInsightConclusion content={generateAIConclusionText(stats)} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SentimentCategoryCard
            title="Netral Insight dari Survey"
            badge={summaryInsights.neutral.length}
            type="neutral"
            insights={summaryInsights.neutral}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Negative Insight dari Survey"
            badge={summaryInsights.negative.length}
            type="negative"
            insights={summaryInsights.negative}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Positif Insight dari Survey"
            badge={summaryInsights.positive.length}
            type="positive"
            insights={summaryInsights.positive}
            onRemoveInsight={handleRemoveInsight}
          />
        </div>
        
        {/* Additional Insights */}
        {insights?.additional && insights.additional.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.additional.map((insight, index) => (
              <div key={index} className="bg-white rounded-[12px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden card-hover">
                <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm text-gray-700">{insight.title}</p>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => handleRemoveInsight(insight.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="h-1.5 rounded-full overflow-hidden bg-muted mb-2">
                    <div className="flex h-full">
                      <div
                        className="bg-[#FDCB6E]"
                        style={{ width: `${insight.neutralPercentage}%` }}
                      />
                      <div
                        className="bg-[#FF7675]"
                        style={{ width: `${insight.negativePercentage}%` }}
                      />
                      <div
                        className="bg-[#00B894]"
                        style={{ width: `${insight.positivePercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-6">
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-[#FDCB6E]"></span>
                      <span>Netral: {insight.neutralPercentage}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-[#FF7675]"></span>
                      <span>Negatif: {insight.negativePercentage}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-[#00B894]"></span>
                      <span>Positif: {insight.positivePercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-eye"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>{insight.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-message-square"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{insight.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>Tidak ada additional insights yang tersedia.</p>
          </div>
        )}
      </div>
      
      <Chatbot />
    </div>
  );
}
