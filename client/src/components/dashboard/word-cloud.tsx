import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5wc from '@amcharts/amcharts5/wc';
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

    // Create root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create series
    const series = root.container.children.push(
      am5wc.WordCloud.new(root, {
        minFontSize: 10,
        maxFontSize: 40,
        minWordLength: 2,
        text: chartData.map(item => item.tag).join(' '),
        randomness: 0.5,
        calculateWeight: (word: string) => {
          // Find the corresponding data item for this word
          const dataItem = chartData.find(item => item.tag === word);
          return dataItem ? dataItem.weight : 1;
        },
        categoryField: "tag",
        valueField: "weight",
        colors: am5.ColorSet.new(root, {}),
        fillModifier: () => {
          // Empty function so that we can set colors manually in the processor
        }
      })
    );

    // Set up rotation for the words
    series.labels.template.setAll({
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 5,
      paddingRight: 5,
      fontFamily: "Inter, sans-serif",
      cursorOverStyle: "pointer",
      oversizedBehavior: "fit"
    });

    // Add some interactivity
    series.labels.template.adapters.add("fill", (fill, target: any) => {
      const dataItem = chartData.find(item => item.tag === target.dataItem?.get("category"));
      
      if (dataItem) {
        const { positivePercentage, neutralPercentage, negativePercentage } = dataItem;
        
        if (positivePercentage > neutralPercentage && positivePercentage > negativePercentage) {
          // Green for positive
          return am5.color(0x00B894);
        } else if (neutralPercentage > positivePercentage && neutralPercentage > negativePercentage) {
          // Yellow for neutral
          return am5.color(0xF1C40F);
        } else {
          // Red for negative
          return am5.color(0xE74C3C);
        }
      }
      
      return fill;
    });

    // Add hover effect
    series.labels.template.states.create("hover", {
      fill: am5.color(0x0984E3),
      scale: 1.1
    });

    // Add click interaction
    series.labels.template.events.on("click", (ev) => {
      const category = ev.target.dataItem?.get("category");
      if (category) {
        console.log(`Clicked on word: ${category}`);
        // You can add filtering logic here
      }
    });

    // Create data
    const seriesData = chartData.map(item => ({
      tag: item.tag,
      weight: item.weight
    }));
    
    // Add data
    series.data.setAll(seriesData);

    // Create controls container for zoom
    const controls = root.container.children.push(
      am5.Container.new(root, {
        x: am5.p100,
        y: 10,
        paddingRight: 15,
        layout: root.verticalLayout,
        centerY: am5.p50,
        y: am5.p50,
        zIndex: 10
      })
    );
    
    // Add zoom buttons with clear styling
    const zoomIn = controls.children.push(
      am5.Button.new(root, {
        marginBottom: 10,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        centerX: am5.p50,
        centerY: am5.p50,
        backgroundColor: am5.color(0xFFFFFF),
        backgroundColorHover: am5.color(0xF5F5F5),
        fill: am5.color(0x0984E3),
        stroke: am5.color(0xDDDDDD),
        icon: am5.Graphics.new(root, {
          svgPath: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
          fill: am5.color(0x0984E3),
          width: 16,
          height: 16
        })
      })
    );

    const zoomOut = controls.children.push(
      am5.Button.new(root, {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        centerX: am5.p50,
        centerY: am5.p50,
        backgroundColor: am5.color(0xFFFFFF),
        backgroundColorHover: am5.color(0xF5F5F5),
        fill: am5.color(0x0984E3),
        stroke: am5.color(0xDDDDDD),
        icon: am5.Graphics.new(root, {
          svgPath: "M19 13H5v-2h14v2z",
          fill: am5.color(0x0984E3),
          width: 16,
          height: 16
        })
      })
    );
    
    // Set up zoom functionality for buttons
    let currentScale = 1;
    const maxScale = 3;
    const minScale = 0.5;
    
    zoomIn.events.on("click", function() {
      if (currentScale < maxScale) {
        currentScale *= 1.2;
        
        // Apply zoom to the entire series
        series.set("scale", currentScale);
        
        // Center the content after zoom
        series.set("x", series.get("x") || 0);
        series.set("y", series.get("y") || 0);
      }
    });
    
    zoomOut.events.on("click", function() {
      if (currentScale > minScale) {
        currentScale *= 0.8;
        
        // Apply zoom to the entire series
        series.set("scale", currentScale);
        
        // Center the content after zoom
        series.set("x", series.get("x") || 0);
        series.set("y", series.get("y") || 0);
      }
    });
    
    // Make the word cloud draggable
    series.set("draggable", true);
    
    // Mouse wheel zoom support
    root.container.set("wheelable", true);
    root.container.events.on("wheel", function(e) {
      const delta = e.originalEvent.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      
      // Apply limits to scaling
      if ((delta > 0 && currentScale > minScale) || 
          (delta < 0 && currentScale < maxScale)) {
        
        currentScale *= zoomFactor;
        
        // Apply zoom to the series
        series.set("scale", currentScale);
        
        // Prevent default browser behavior (page scrolling)
        e.originalEvent.preventDefault();
      }
    });

    // Make chart responsive
    series.appear(1000, 100);

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
      <div ref={chartRef} style={{ width, height }} className="cursor-move" />
    </div>
  );
};

export default WordCloud;