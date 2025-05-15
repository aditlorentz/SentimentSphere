import { X } from "lucide-react";
import { 
  ProgressBar, 
  SentimentMetrics, 
  InsightStats 
} from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

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
  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-sm text-gray-700">{insight.title}</p>
        <button 
          className="text-gray-400 hover:text-blue-600"
          onClick={() => onRemove ? onRemove(insight.id) : {}}
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
  );
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
        <button className="text-gray-400 hover:text-blue-600">
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
