import Header from "@/components/layout/header";
import { SentimentCategoryCard, InsightData } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function MyInsights() {
  // State untuk menyimpan insights yang dipin
  const [pinnedInsights, setPinnedInsights] = useState<{
    neutral: InsightData[];
    negative: InsightData[];
    positive: InsightData[];
  }>({
    neutral: [],
    negative: [],
    positive: []
  });
  
  // State untuk loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Load pinned insights from localStorage
  useEffect(() => {
    const loadPinnedInsights = () => {
      setIsLoading(true);
      
      const pinnedInsightsStr = localStorage.getItem('pinnedInsights');
      
      if (pinnedInsightsStr) {
        try {
          const allPinnedInsights: InsightData[] = JSON.parse(pinnedInsightsStr);
          
          // Kategorikan insights berdasarkan sentimen dominan
          const categorized = {
            neutral: [] as InsightData[],
            negative: [] as InsightData[],
            positive: [] as InsightData[]
          };
          
          allPinnedInsights.forEach(insight => {
            const { neutralPercentage, negativePercentage, positivePercentage } = insight;
            
            // Tentukan sentimen dominan
            if (neutralPercentage >= negativePercentage && neutralPercentage >= positivePercentage) {
              categorized.neutral.push(insight);
            } else if (negativePercentage >= neutralPercentage && negativePercentage >= positivePercentage) {
              categorized.negative.push(insight);
            } else {
              categorized.positive.push(insight);
            }
          });
          
          setPinnedInsights(categorized);
        } catch (e) {
          console.error('Error parsing pinned insights:', e);
        }
      }
      
      setIsLoading(false);
    };
    
    loadPinnedInsights();
    
    // Add event listener untuk mendeteksi perubahan di localStorage dari tab lain
    window.addEventListener('storage', loadPinnedInsights);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', loadPinnedInsights);
    };
  }, []);

  const handleRemoveInsight = (id: number) => {
    // Get existing pinned insights
    const existingPinnedString = localStorage.getItem('pinnedInsights');
    
    if (existingPinnedString) {
      try {
        const pinnedInsights = JSON.parse(existingPinnedString);
        // Remove insight with matching id
        const updatedPinnedInsights = pinnedInsights.filter((insight: InsightData) => insight.id !== id);
        // Save back to localStorage
        localStorage.setItem('pinnedInsights', JSON.stringify(updatedPinnedInsights));
        
        // Trigger storage event for this tab (since storage events only trigger in other tabs)
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Error removing pinned insight:', e);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-x-hidden">
        <Header title="My Insights" />
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-[12px] p-6 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-semibold text-primary mb-3">My Pinned Insights</h2>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[12px] h-80 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="My Insight" />
      
      <div className="p-6">
        <div className="bg-white rounded-[12px] p-6 mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">My Pinned Insights</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Pinned
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Here are your pinned insights from various surveys and feedback. These insights have been marked as important for follow-up and monitoring. The insights are categorized by sentiment to help track progress and identify areas needing attention.
          </p>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SentimentCategoryCard
            title="Netral"
            badge={pinnedInsights.neutral.length}
            type="neutral"
            insights={pinnedInsights.neutral}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Negatif"
            badge={pinnedInsights.negative.length}
            type="negative"
            insights={pinnedInsights.negative}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Positif"
            badge={pinnedInsights.positive.length}
            type="positive"
            insights={pinnedInsights.positive}
            onRemoveInsight={handleRemoveInsight}
          />
        </div>
      </div>
      
      <Chatbot />
    </div>
  );
}
