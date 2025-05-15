import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Header from "@/components/layout/header";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import { SentimentCategoryCard } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { InsightData } from "@/components/cards/insight-card";
import { CategoryInsights, SurveyDashboardSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";

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
  const [limit] = useState(10);
  
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
  
  // Create a ref for the loader element
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Fetch survey dashboard summary data with pagination
  const { 
    data: summaryData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading: summaryLoading 
  } = useInfiniteQuery({
    queryKey: ['/api/survey-dashboard/summary'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/survey-dashboard/summary?page=${pageParam}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.data || lastPage.data.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    
    if (!currentLoaderRef || isFetchingNextPage || !hasNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(currentLoaderRef);
    
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  // Convert survey dashboard summary data to sentiment categories
  const categories = useMemo(() => {
    const result = {
      positive: [] as InsightData[],
      negative: [] as InsightData[],
      neutral: [] as InsightData[],
    };
    
    if (!summaryData?.pages) return result;
    
    // Process each page of data
    summaryData.pages.forEach(page => {
      if (!page.data) return;
      
      page.data.forEach((item: SurveyDashboardSummary) => {
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
        
        // Add to appropriate category based on highest percentage
        if (maxPercent === posPercent && maxPercent > 0) {
          result.positive.push(insight);
        } else if (maxPercent === negPercent && maxPercent > 0) {
          result.negative.push(insight);
        } else if (maxPercent === neutPercent && maxPercent > 0) {
          result.neutral.push(insight);
        }
      });
    });
    
    return result;
  }, [summaryData]);
  
  // Handler for removing insights
  const handleRemoveInsight = (id: number) => {
    console.log(`Removing insight with ID: ${id}`);
    // In a real app, we would call an API and then invalidate the query
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
  
  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="Survey Dashboard" />
      
      <div className="p-6">
        <AIInsightConclusion content={generateAIConclusionText(stats)} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SentimentCategoryCard
            title="Netral Insight dari Survey"
            badge={categories.neutral.length}
            type="neutral"
            insights={categories.neutral}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Negative Insight dari Survey"
            badge={categories.negative.length}
            type="negative"
            insights={categories.negative}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Positif Insight dari Survey"
            badge={categories.positive.length}
            type="positive"
            insights={categories.positive}
            onRemoveInsight={handleRemoveInsight}
          />
        </div>
        
        {/* Load more trigger for infinite scroll */}
        {hasNextPage && (
          <div className="flex justify-center my-8" ref={loaderRef}>
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              className="px-8"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More Insights'}
            </Button>
          </div>
        )}
        
        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center my-4">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        
        {/* Show chat bot */}
        <div className="mt-8">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}