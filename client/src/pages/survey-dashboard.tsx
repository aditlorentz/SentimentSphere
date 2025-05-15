import { useEffect } from "react";
import Header from "@/components/layout/header";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import { SentimentCategoryCard } from "@/components/cards/insight-card";
import Chatbot from "@/components/dashboard/chatbot";
import { useQuery } from "@tanstack/react-query";
import { InsightData } from "@/components/cards/insight-card";

const aiConclusionText = `Berdasarkan analisis sentimen, mayoritas tanggapan bersifat netral (69) dengan beberapa umpan baik positif (15) dan negatif (7). Topik "kepegawaian hc" dan "bonus tahunan hc" mendapat perhatian tertinggi. Kritik konstruktif terkait kebijakan bimbingan dan kenaikan gaji menunjukkan area yang perlu ditingkatkan. Secara keseluruhan, sentimen karyawan cenderung netral dengan beberapa area yang memerlukan perhatian manajemen.`;

export default function SurveyDashboard() {
  // Fetch insights data
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/insights'],
    queryFn: async () => {
      // This would normally be fetched from the API
      // For now, we'll simulate a delay and return mock data
      return new Promise<{
        neutral: InsightData[];
        negative: InsightData[];
        positive: InsightData[];
        additional: InsightData[];
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
              {
                id: 3,
                title: "bonus tahunan hc",
                neutralPercentage: 35,
                negativePercentage: 0,
                positivePercentage: 65,
                views: 156,
                comments: 2,
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
              {
                id: 5,
                title: "kritik konstruktif",
                neutralPercentage: 11,
                negativePercentage: 79,
                positivePercentage: 10,
                views: 134,
                comments: 9,
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
              {
                id: 7,
                title: "kepegawaian hc",
                neutralPercentage: 4,
                negativePercentage: 0,
                positivePercentage: 96,
                views: 178,
                comments: 13,
              },
            ],
            additional: [
              {
                id: 8,
                title: "kebijakan kenaikan gaji",
                neutralPercentage: 30,
                negativePercentage: 0,
                positivePercentage: 70,
                views: 67,
                comments: 1,
              },
              {
                id: 9,
                title: "evaluasi kebijakan bimbingan",
                neutralPercentage: 41,
                negativePercentage: 56,
                positivePercentage: 3,
                views: 86,
                comments: 5,
              },
              {
                id: 10,
                title: "kepegawaian hc",
                neutralPercentage: 4,
                negativePercentage: 0,
                positivePercentage: 96,
                views: 178,
                comments: 13,
              },
            ],
          });
        }, 500);
      });
    },
  });

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
        <AIInsightConclusion content={aiConclusionText} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights?.additional.map((insight, index) => (
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
      </div>
      
      <Chatbot />
    </div>
  );
}
