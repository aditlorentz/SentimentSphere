import { X, RefreshCw, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIInsightConclusionProps {
  onClose?: () => void;
  pageContext?: string; // Optional custom page context
  filterData?: {
    wordInsight?: string; 
    wordInsightValues?: string[];
    source?: string;
    survey?: string;
  }; // Current filter values
}

export default function AIInsightConclusion({
  onClose,
  pageContext,
  filterData,
}: AIInsightConclusionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [location] = useLocation();
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [testResponse, setTestResponse] = useState<string>("");
  const [isTestLoading, setIsTestLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Determine page context from current route if not explicitly provided
  const currentPage = pageContext || (() => {
    if (location.includes("top-insights")) return "top-insights";
    if (location.includes("smart-analytics")) return "analytics";
    if (location.includes("action-page")) return "action-page";
    return "dashboard"; // default
  })();

  // Add a random seed to trigger a different result on each refresh
  const randomSeed = Math.random().toString(36).substring(2, 10);
  
  // Handle test prompt submission
  const handleTestPrompt = async () => {
    if (!testPrompt.trim()) return;
    
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/test-ai-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: testPrompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process test prompt');
      }
      
      const data = await response.json();
      setTestResponse(data.summary);
    } catch (error) {
      console.error('Error testing prompt:', error);
      setTestResponse('Terjadi kesalahan saat memproses prompt. Silakan coba lagi.');
    } finally {
      setIsTestLoading(false);
    }
  };

  // Fetch AI summary from the API with page context
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/ai-summary', currentPage, filterData, randomSeed],
    queryFn: async () => {
      // Build the query string with filter data
      let queryString = `/api/ai-summary?page=${currentPage}&seed=${randomSeed}`;
      
      if (filterData) {
        // Add single word insight filter if available
        if (filterData.wordInsight && filterData.wordInsight !== 'all') {
          queryString += `&wordInsight=${encodeURIComponent(filterData.wordInsight)}`;
        }
        
        // Add multiple wordInsightValues if available
        if (filterData.wordInsightValues && filterData.wordInsightValues.length > 0 && 
            !filterData.wordInsightValues.includes('all')) {
          filterData.wordInsightValues.forEach(value => {
            queryString += `&wordInsights[]=${encodeURIComponent(value)}`;
          });
        }
        
        // Add source filter if available
        if (filterData.source && filterData.source !== 'all') {
          queryString += `&source=${encodeURIComponent(filterData.source)}`;
        }
        
        // Add survey filter if available
        if (filterData.survey && filterData.survey !== 'all') {
          queryString += `&survey=${encodeURIComponent(filterData.survey)}`;
        }
      }
      
      const response = await fetch(queryString);
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="text-gray-400 hover:text-gray-500"
                title="Test AI with custom prompt"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Test AI dengan prompt khusus</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Ketik prompt Anda di sini..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isTestLoading) {
                      handleTestPrompt();
                    }
                  }}
                />
                <Button 
                  className="w-full" 
                  onClick={handleTestPrompt}
                  disabled={isTestLoading || !testPrompt.trim()}
                >
                  {isTestLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memproses...
                    </>
                  ) : 'Kirim Prompt'}
                </Button>
                {testResponse && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">Hasil:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{testResponse}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {data?.summary || "Tidak ada kesimpulan yang tersedia saat ini."}
        </p>
      )}
    </div>
  );
}
