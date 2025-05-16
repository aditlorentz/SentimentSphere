import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface WordCloudDataItem {
  wordInsight: string;
  totalCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
}

interface WordCloudProps {
  width?: string;
  height?: string;
  title?: string;
  useRealData?: boolean;
}

// Simple React-based word cloud without heavy chart libraries
const WordCloud: React.FC<WordCloudProps> = ({ 
  width = '100%', 
  height = '320px',
  title = "Common Topics",
  useRealData = true
}) => {
  // Fetch data from the API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['/api/survey-dashboard/summary'],
    queryFn: async () => {
      if (!useRealData) return [];
      
      const response = await fetch('/api/survey-dashboard/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch word cloud data');
      }
      
      const result = await response.json();
      return result.data as WordCloudDataItem[];
    },
    enabled: useRealData
  });

  // Process data for the word cloud
  const processedData = React.useMemo(() => {
    if (!apiData) return [];
    
    // Sort by total count (weight)
    return [...apiData]
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 40); // Limit to 40 words for performance
  }, [apiData]);

  // Calculate the maximum weight for font size scaling
  const maxWeight = React.useMemo(() => {
    if (!processedData.length) return 1;
    return Math.max(...processedData.map(item => item.totalCount));
  }, [processedData]);

  // Function to determine color based on sentiment
  const getSentimentColor = (item: WordCloudDataItem) => {
    const { positivePercentage, neutralPercentage, negativePercentage } = item;
    
    if (positivePercentage > neutralPercentage && positivePercentage > negativePercentage) {
      return '#00B894'; // Green for positive
    } else if (neutralPercentage > positivePercentage && neutralPercentage > negativePercentage) {
      return '#F1C40F'; // Yellow for neutral
    } else {
      return '#E74C3C'; // Red for negative
    }
  };

  // Function to calculate font size based on weight
  const getFontSize = (weight: number) => {
    const minSize = 12;
    const maxSize = 32;
    return minSize + ((weight / maxWeight) * (maxSize - minSize));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div style={{ width, height }} className="flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading word cloud data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      
      <div 
        className="p-4 flex flex-wrap justify-center items-center relative overflow-hidden" 
        style={{ width, height, minHeight: '300px' }}
      >
        {processedData.length === 0 ? (
          <div className="text-gray-400">No data available</div>
        ) : (
          <>
            {/* Top 10 words - prominently displayed in grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-6 w-full">
              {processedData.slice(0, 10).map((item) => (
                <div 
                  key={`top-${item.wordInsight}`}
                  className="flex justify-center items-center p-2 transition-all duration-200 cursor-pointer hover:scale-105 text-center"
                  style={{
                    color: getSentimentColor(item),
                    fontSize: `${getFontSize(item.totalCount)}px`,
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  title={`${item.wordInsight}: ${item.totalCount} mentions`}
                >
                  {item.wordInsight}
                </div>
              ))}
            </div>

            {/* Remaining words */}
            <div className="flex flex-wrap justify-center">
              {processedData.slice(10).map((item) => (
                <div 
                  key={`word-${item.wordInsight}`}
                  className="m-1 md:m-2 p-1 transition-all duration-200 cursor-pointer hover:scale-105 hover:z-10"
                  style={{
                    color: getSentimentColor(item),
                    fontSize: `${Math.max(10, getFontSize(item.totalCount) * 0.7)}px`,
                    fontWeight: 500,
                  }}
                  title={`${item.wordInsight}: ${item.totalCount} mentions`}
                >
                  {item.wordInsight}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 text-xs flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#00B894' }}></div>
                <span>Positive</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#F1C40F' }}></div>
                <span>Neutral</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#E74C3C' }}></div>
                <span>Negative</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WordCloud;