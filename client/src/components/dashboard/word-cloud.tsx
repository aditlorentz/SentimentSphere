import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { useQuery } from '@tanstack/react-query';

interface WordCloudDataItem {
  wordInsight: string;
  totalCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
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
        weight: item.totalCount,
        positivePercentage: item.positivePercentage,
        neutralPercentage: item.neutralPercentage,
        negativePercentage: item.negativePercentage
      }))
    : data || [];

  useLayoutEffect(() => {
    // Initialize chart only if we have data and DOM is ready
    if ((!chartData || chartData.length === 0) || !chartRef.current) return;

    // Dispose previous chart if exists
    if (rootRef.current) {
      rootRef.current.dispose();
    }

    // Create a simpler visualization for the word cloud since we can't use internal modules
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create container for the tags
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.horizontalLayout
      })
    );

    // Function to determine color based on sentiment
    const getColorFromSentiment = (item: any) => {
      // Default color for non-real data
      if (!useRealData || !('positivePercentage' in item)) {
        return am5.color(0x333333);
      }
      
      // Determine the dominant sentiment
      const { positivePercentage, neutralPercentage, negativePercentage } = item;
      
      if (positivePercentage > neutralPercentage && positivePercentage > negativePercentage) {
        // Green for positive (darker green for higher percentage)
        return am5.color(0x00B894); // Primary positive color
      } else if (neutralPercentage > positivePercentage && neutralPercentage > negativePercentage) {
        // Yellow for neutral
        return am5.color(0xF1C40F); // Primary neutral color
      } else {
        // Red for negative
        return am5.color(0xE74C3C); // Primary negative color
      }
    };

    // Function to distribute words in a cloud-like pattern
    const renderWords = () => {
      // Clear existing words
      container.children.clear();
      
      // Sort by weight to place more important words first
      const sortedData = [...chartData].sort((a, b) => b.weight - a.weight);
      
      // Set positions in a circular pattern
      sortedData.forEach((item, index) => {
        // Calculate font size based on weight
        const minSize = 10;
        const maxSize = 36;
        const range = maxSize - minSize;
        const maxWeight = Math.max(...chartData.map(item => item.weight));
        const fontSize = minSize + (item.weight / maxWeight) * range;
        
        // Calculate position (spiral-like arrangement)
        const angle = index * 0.35; // Controls spiral tightness
        const radius = index * 3; // Controls spiral size
        const x = Math.cos(angle) * radius + 50; // Center x percentage
        const y = Math.sin(angle) * radius + 50; // Center y percentage
        
        // Determine color based on sentiment
        const fillColor = getColorFromSentiment(item);
        
        // Create a text element for the word
        const label = container.children.push(
          am5.Label.new(root, {
            x: am5.percent(x),
            y: am5.percent(y),
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            text: item.tag,
            fontSize: fontSize,
            fill: fillColor,
            fontFamily: "Inter, sans-serif",
            fontWeight: "500",
            oversizedBehavior: "wrap"
          })
        );
        
        // Make labels interactive
        label.events.on("click", function() {
          console.log(`Tag clicked: ${item.tag}`);
          // Handle click event here (e.g., filter data by tag)
        });
        
        label.events.on("pointerover", function() {
          label.set("fill", am5.color(0x0984E3));
          label.set("scale", 1.1);
        });
        
        label.events.on("pointerout", function() {
          label.set("fill", fillColor);
          label.set("scale", 1);
        });
      });
    };
    
    // Initial render
    renderWords();
    
    // Make labels animate in
    container.children.each((child) => {
      child.appear(1000, 100);
    });

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