import { X, Info } from "lucide-react";
import { 
  ProgressBar, 
  SentimentMetrics, 
  InsightStats 
} from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface InsightData {
  id: number;
  title: string;
  neutralPercentage: number;
  negativePercentage: number;
  positivePercentage: number;
  views: number;
  comments: number;
}

interface InsightItemProps {
  insight: InsightData;
  onRemove?: (id: number) => void;
}

export function InsightItem({ insight, onRemove }: InsightItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <>
      <div 
        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-sm text-gray-700">{insight.title}</p>
          <div className="flex space-x-2">
            <button 
              className="text-gray-400 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
            >
              <Info className="h-4 w-4" />
            </button>
            <button 
              className="text-gray-400 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) onRemove(insight.id);
              }}
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
                className="lucide lucide-pin"
              >
                <line x1="12" x2="12" y1="17" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 16.24Z" />
              </svg>
            </button>
          </div>
        </div>
        
        <ProgressBar 
          neutralPercentage={insight.neutralPercentage}
          negativePercentage={insight.negativePercentage}
          positivePercentage={insight.positivePercentage}
          className="mb-2"
        />
        
        <SentimentMetrics 
          neutralPercentage={insight.neutralPercentage}
          negativePercentage={insight.negativePercentage}
          positivePercentage={insight.positivePercentage}
        />
        
        <InsightStats views={insight.views} comments={insight.comments} />
      </div>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{insight.title}</DialogTitle>
            <DialogDescription className="text-base">
              Detail Word Insight
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Distribusi Sentimen</h4>
              <ProgressBar 
                neutralPercentage={insight.neutralPercentage}
                negativePercentage={insight.negativePercentage}
                positivePercentage={insight.positivePercentage}
                className="mb-2"
              />
              
              <div className="grid grid-cols-3 gap-2 my-2">
                <div className="bg-yellow-50 p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">Netral</p>
                  <p className="text-xl font-bold text-yellow-500">{insight.neutralPercentage}%</p>
                </div>
                <div className="bg-red-50 p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">Negatif</p>
                  <p className="text-xl font-bold text-red-500">{insight.negativePercentage}%</p>
                </div>
                <div className="bg-green-50 p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">Positif</p>
                  <p className="text-xl font-bold text-green-500">{insight.positivePercentage}%</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Statistik</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Views</p>
                  <p className="text-lg font-bold text-blue-500">{insight.views}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Comments</p>
                  <p className="text-lg font-bold text-indigo-500">{insight.comments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Word Insight Interpretation</h4>
              <p className="text-sm text-gray-600">
                Kata kunci "{insight.title}" memiliki sentimen {getDominantSentiment(insight)} 
                dengan {getPercentageForSentiment(insight, getDominantSentiment(insight))}% dari total. 
                Ini menunjukkan bahwa tanggapan karyawan terhadap topik ini cenderung 
                {getDominantSentimentDescription(insight)}.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function untuk mendapatkan sentimen dominan
function getDominantSentiment(insight: InsightData): "neutral" | "negative" | "positive" {
  const { neutralPercentage, negativePercentage, positivePercentage } = insight;
  
  if (neutralPercentage >= negativePercentage && neutralPercentage >= positivePercentage) {
    return "neutral";
  } else if (negativePercentage >= neutralPercentage && negativePercentage >= positivePercentage) {
    return "negative";
  } else {
    return "positive";
  }
}

// Helper function untuk mendapatkan percentage berdasarkan jenis sentimen
function getPercentageForSentiment(insight: InsightData, sentiment: "neutral" | "negative" | "positive"): number {
  switch (sentiment) {
    case "neutral":
      return insight.neutralPercentage;
    case "negative":
      return insight.negativePercentage;
    case "positive":
      return insight.positivePercentage;
    default:
      return 0;
  }
}

// Helper function untuk deskripsi sentimen
function getDominantSentimentDescription(insight: InsightData): string {
  const sentiment = getDominantSentiment(insight);
  
  switch (sentiment) {
    case "neutral":
      return " netral atau seimbang";
    case "negative":
      return " negatif dan perlu perhatian";
    case "positive":
      return " positif dan menunjukkan kepuasan";
    default:
      return "";
  }
}

export interface SentimentCategoryProps {
  title: string;
  badge: number;
  type: "neutral" | "negative" | "positive";
  insights: InsightData[];
  onRemoveInsight?: (id: number) => void;
  className?: string;
}

export function SentimentCategoryCard({
  title,
  badge,
  type,
  insights,
  onRemoveInsight,
  className,
}: SentimentCategoryProps) {
  const getBadgeColor = () => {
    switch (type) {
      case "neutral":
        return "bg-yellow-100 text-yellow-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "positive":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("bg-white rounded-[12px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden card-hover", className)}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-primary">{title}</h3>
          <span className={`${getBadgeColor()} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
            {badge}
          </span>
        </div>

      </div>
      
      {insights.map((insight) => (
        <InsightItem 
          key={insight.id} 
          insight={insight} 
          onRemove={onRemoveInsight}
        />
      ))}
    </div>
  );
}
