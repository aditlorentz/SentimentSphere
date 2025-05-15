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
  
  // State for infinite scroll
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Fetch survey dashboard summary data with pagination
  const { 
    data: summaryData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading: summaryLoading,
    isError: summaryError
  } = useInfiniteQuery({
    queryKey: ['/api/survey-dashboard/summary'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/survey-dashboard/summary?page=${pageParam}&limit=${limit}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.data || lastPage.data.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // Set up infinite scroll with Intersection Observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // Set up the observer
  useEffect(() => {
    const currentRef = loadingRef.current;
    
    if (currentRef && !isFetchingNextPage && hasNextPage) {
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      });
      
      observerRef.current.observe(currentRef);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadingRef, isFetchingNextPage, fetchNextPage, hasNextPage]);
  
  // Convert infinite query survey dashboard summary data to insights format
  const summaryInsights = useMemo(() => {
    if (!summaryData?.pages) {
      return {
        positive: [],
        negative: [],
        neutral: []
      } as CategoryInsights;
    }
    
    const positive: InsightData[] = [];
    const negative: InsightData[] = [];
    const neutral: InsightData[] = [];
    
    // Flatten the pages data
    summaryData.pages.forEach(page => {
      if (page && page.data) {
        page.data.forEach((item: SurveyDashboardSummary) => {
          // Determine the dominant sentiment based on the highest percentage
          const posPercent = item.positivePercentage || 0;
          const negPercent = item.negativePercentage || 0;
          const neutPercent = item.neutralPercentage || 0;
          
          const maxPercentage = Math.max(posPercent, negPercent, neutPercent);
          
          // Create insight data object
          const insightData: InsightData = {
            id: item.id,
            title: item.wordInsight,
            positivePercentage: posPercent,
            negativePercentage: negPercent,
            neutralPercentage: neutPercent,
            views: item.totalCount,
            comments: 0
          };
          
          // Add to appropriate category based on dominant sentiment
          if (maxPercentage === posPercent && maxPercentage > 0) {
            positive.push(insightData);
          } else if (maxPercentage === negPercent && maxPercentage > 0) {
            negative.push(insightData);
          } else if (maxPercentage === neutPercent && maxPercentage > 0) {
            neutral.push(insightData);
          }
        });
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
  
  // Check if all data is still loading
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
        
        {/* Infinite Scroll Trigger */}
        {hasNextPage && (
          <div className="flex justify-center my-8" ref={loadingRef}>
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