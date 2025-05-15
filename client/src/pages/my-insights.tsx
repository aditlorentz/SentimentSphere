import Header from "@/components/layout/header";
import { SentimentCategoryCard } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { InsightData } from "@/components/cards/insight-card";

export default function MyInsights() {
  // Fetch insights data
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/my-insights'],
    queryFn: async () => {
      // This would normally be fetched from the API
      return new Promise<{
        neutral: InsightData[];
        negative: InsightData[];
        positive: InsightData[];
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            neutral: [
              {
                id: 1,
                title: "masukan remote working",
                neutralPercentage: 55,
                negativePercentage: 5,
                positivePercentage: 40,
                views: 125,
                comments: 5,
              },
              {
                id: 2,
                title: "kritik konstruktif",
                neutralPercentage: 45,
                negativePercentage: 10,
                positivePercentage: 45,
                views: 88,
                comments: 7,
              },
            ],
            negative: [
              {
                id: 4,
                title: "kritik konstruktif",
                neutralPercentage: 8,
                negativePercentage: 89,
                positivePercentage: 3,
                views: 189,
                comments: 16,
              },
            ],
            positive: [
              {
                id: 6,
                title: "bonus tahunan hc",
                neutralPercentage: 33,
                negativePercentage: 0,
                positivePercentage: 67,
                views: 75,
                comments: 3,
              },
            ],
          });
        }, 500);
      });
    },
  });

  const handleRemoveInsight = (id: number) => {
    console.log(`Removing insight with ID: ${id}`);
    // In a real app, we would call API and then invalidate the query
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
            title="Netral Insight"
            badge={69}
            type="neutral"
            insights={insights?.neutral || []}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Negative Insight"
            badge={7}
            type="negative"
            insights={insights?.negative || []}
            onRemoveInsight={handleRemoveInsight}
          />
          
          <SentimentCategoryCard
            title="Positif Insight"
            badge={15}
            type="positive"
            insights={insights?.positive || []}
            onRemoveInsight={handleRemoveInsight}
          />
        </div>
      </div>
      
      <Chatbot />
    </div>
  );
}
