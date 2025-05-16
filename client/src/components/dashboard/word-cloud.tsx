import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { useQuery } from '@tanstack/react-query';

interface WordCloudDataItem {
  wordInsight: string;
  totalCount: number;
}

interface WordCloudProps {
  data?: Array<{
    tag: string;
    weight: number;
  }>;
  width?: string;
  height?: string;
  title?: string;
  useRealData?: boolean;
}

// Predefined colors for words
const COLORS = [
  "#0984E3", // blue
  "#00B894", // green
  "#E84393", // pink
  "#6C5CE7", // purple
  "#FDCB6E", // yellow
  "#E17055", // orange
  "#2D3436"  // dark gray
];

const WordCloud: React.FC<WordCloudProps> = ({ 
  data, 
  width = '100%', 
  height = '300px',
  title = "Common Topics",
  useRealData = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  
  // Fetch real data from the API if useRealData is true
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['/api/survey-dashboard/summary'],
    queryFn: async () => {
      if (!useRealData) return null;
      
      const response = await fetch('/api/survey-dashboard/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch word cloud data');
      }
      
      const result = await response.json();
      return result.data as WordCloudDataItem[];
    },
    enabled: useRealData
  });
  
  // Determine which data to use (API data or prop data)
  const chartData = useRealData && apiData 
    ? apiData.map(item => ({
        tag: item.wordInsight,
        weight: item.totalCount
      }))
    : data || [];

  useLayoutEffect(() => {
    // Initialize chart only if we have data and DOM is ready
    if ((!chartData || chartData.length === 0) || !chartRef.current) return;

    // Dispose previous chart if exists
    if (rootRef.current) {
      rootRef.current.dispose();
    }

    // Create a root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a container for words
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.horizontalLayout
      })
    );

    // Function to create a simple grid layout
    const renderWords = () => {
      // Clear existing words
      container.children.clear();
      
      // Sort words by weight (for grid layout)
      const sortedData = [...chartData].sort((a, b) => b.weight - a.weight);
      
      // Define grid layout
      const COLS = 5;
      const ROWS = 10;
      const CELL_WIDTH = 100 / COLS;
      const CELL_HEIGHT = 100 / ROWS;
      
      // Helper function to get position in grid
      const getPosition = (index: number) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        
        // Center each word in its cell with small random offset
        const x = (col * CELL_WIDTH) + (CELL_WIDTH / 2) + (Math.random() * 8 - 4);
        const y = (row * CELL_HEIGHT) + (CELL_HEIGHT / 2) + (Math.random() * 8 - 4);
        
        return { x, y };
      };
      
      // Add words to grid
      sortedData.forEach((item, index) => {
        // Get word position
        const { x, y } = getPosition(index);
        
        // Get random color
        const colorIndex = index % COLORS.length;
        const color = COLORS[colorIndex];
        
        // Create label for word
        const label = container.children.push(
          am5.Label.new(root, {
            text: item.tag,
            fontSize: 16, // Fixed size font
            fontFamily: "Inter, sans-serif",
            fill: am5.color(color),
            x: am5.percent(x),
            y: am5.percent(y),
            centerX: am5.p50,
            centerY: am5.p50
          })
        );
        
        // Add hover effect
        label.states.create("hover", {
          scale: 1.2,
          fill: am5.color(COLORS[0])
        });
        
        // Add interactivity
        label.events.on("pointerover", () => {
          label.states.applyAnimate("hover");
        });
        
        label.events.on("pointerout", () => {
          label.states.applyAnimate("default");
        });
      });
    };
    
    // Render the word cloud
    renderWords();

    return () => {
      // Clean up on unmount
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, [chartData, useRealData]);

  // Show loading state
  if (useRealData && isLoading) {
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
      <div ref={chartRef} style={{ width, height }} />
    </div>
  );
};

export default WordCloud;