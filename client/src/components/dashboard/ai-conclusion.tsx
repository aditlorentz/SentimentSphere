import { X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AIInsightConclusionProps {
  onClose?: () => void;
  pageContext?: string; // Optional custom page context
}

export default function AIInsightConclusion({
  onClose,
  pageContext,
}: AIInsightConclusionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [location] = useLocation();
  
  // Determine page context from current route if not explicitly provided
  const currentPage = pageContext || (() => {
    if (location.includes("top-insights")) return "top-insights";
    if (location.includes("smart-analytics")) return "analytics";
    if (location.includes("action-page")) return "action-page";
    return "dashboard"; // default
  })();

  // Fetch AI summary from the API with page context
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/ai-summary', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/ai-summary?page=${currentPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch AI summary');
      }
      return response.json();
    },
  });

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-[12px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-display font-semibold text-black tracking-tight">
            AI Instant Conclusion
          </h2>
          <span className="bg-blue-900 text-white text-xs font-medium px-2 py-1 rounded-full">
            NLP AI
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={handleRefresh}
            title="Refresh conclusion"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-gray-600 text-sm flex items-center">
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Menghasilkan kesimpulan cerdas dengan NLP AI...
        </div>
      ) : isError ? (
        <div className="text-red-500 text-sm">
          Terjadi kesalahan saat memuat kesimpulan AI: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : (
        <p className="text-gray-700 text-sm leading-relaxed">
          {data?.summary || "Tidak ada kesimpulan yang tersedia saat ini."}
        </p>
      )}
    </div>
  );
}
