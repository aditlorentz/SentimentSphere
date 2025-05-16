import React, { useLayoutEffect, useRef } from 'react';
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

    // Create a root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a container for our content
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.horizontalLayout
      })
    );

    // Create a container for the word cloud
    const wordCloudContainer = container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.horizontalLayout
      })
    );

    // Create the control panel
    const controlPanel = root.container.children.push(
      am5.Container.new(root, {
        x: am5.percent(95),
        y: am5.percent(10),
        layout: root.verticalLayout,
        paddingRight: 10,
        zIndex: 100
      })
    );

    // Add controls for zoom
    const zoomIn = controlPanel.children.push(
      am5.Button.new(root, {
        width: 30,
        height: 30,
        marginBottom: 10,
        icon: am5.Graphics.new(root, {
          svgPath: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
          fill: am5.color(0x0984E3),
          width: 16,
          height: 16,
          centerX: am5.percent(50),
          centerY: am5.percent(50)
        }),
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xFFFFFF),
          stroke: am5.color(0xDDDDDD),
          cornerRadiusTL: 5,
          cornerRadiusTR: 5,
          cornerRadiusBL: 5,
          cornerRadiusBR: 5
        })
      })
    );

    const zoomOut = controlPanel.children.push(
      am5.Button.new(root, {
        width: 30,
        height: 30,
        icon: am5.Graphics.new(root, {
          svgPath: "M19 13H5v-2h14v2z",
          fill: am5.color(0x0984E3),
          width: 16,
          height: 16,
          centerX: am5.percent(50),
          centerY: am5.percent(50)
        }),
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xFFFFFF),
          stroke: am5.color(0xDDDDDD),
          cornerRadiusTL: 5,
          cornerRadiusTR: 5,
          cornerRadiusBL: 5,
          cornerRadiusBR: 5
        })
      })
    );

    // Scale parameters
    let currentScale = 1;
    const minScale = 0.5;
    const maxScale = 2;

    // Function to distribute words in a cloud-like pattern
    const renderWords = () => {
      // Clear existing words
      wordCloudContainer.children.clear();
      
      // Sort by weight to place more important words first
      const sortedData = [...chartData].sort((a, b) => b.weight - a.weight);
      
      // Get the maximum weight for scale calculation
      const maxWeight = Math.max(...sortedData.map(item => item.weight));
      
      // Helper function to determine color based on sentiment
      const getColorBySentiment = (item: any) => {
        const { positivePercentage, neutralPercentage, negativePercentage } = item;
        
        if (positivePercentage > neutralPercentage && positivePercentage > negativePercentage) {
          return am5.color(0x00B894); // Green for positive
        } else if (neutralPercentage > positivePercentage && neutralPercentage > negativePercentage) {
          return am5.color(0xF1C40F); // Yellow for neutral
        } else {
          return am5.color(0xE74C3C); // Red for negative
        }
      };
      
      // Set up a grid layout for larger words
      const grid = {
        cols: 5,                   // Number of columns in the grid
        rows: 4,                   // Number of rows in the grid
        cellWidth: 100 / 5,        // Width of each cell as percentage of container
        cellHeight: 100 / 4,       // Height of each cell
        center: { x: 50, y: 50 }   // Center of the container
      };
      
      // Get top words for grid layout
      const topWords = sortedData.slice(0, grid.cols * grid.rows);
      const otherWords = sortedData.slice(grid.cols * grid.rows);
      
      // Function to calculate grid position
      const getGridPosition = (index: number) => {
        const row = Math.floor(index / grid.cols);
        const col = index % grid.cols;
        
        // Calculate x,y coordinates based on grid cell
        const cellCenterX = (col * grid.cellWidth) + (grid.cellWidth / 2);
        const cellCenterY = (row * grid.cellHeight) + (grid.cellHeight / 2);
        
        // Add some randomization within the cell
        const jitterX = (Math.random() - 0.5) * grid.cellWidth * 0.5;
        const jitterY = (Math.random() - 0.5) * grid.cellHeight * 0.5;
        
        return {
          x: cellCenterX + jitterX,
          y: cellCenterY + jitterY
        };
      };
      
      // Position words in an organized grid with some randomness
      topWords.forEach((item, index) => {
        // Calculate font size based on weight - larger for top words
        const minFontSize = 14;
        const maxFontSize = 40;
        const fontRange = maxFontSize - minFontSize;
        const fontSize = minFontSize + (item.weight / maxWeight) * fontRange;
        
        // Get position from grid layout
        const position = getGridPosition(index);
        
        // Get color based on sentiment
        const textColor = getColorBySentiment(item);
        
        // Create word label
        const label = wordCloudContainer.children.push(
          am5.Label.new(root, {
            text: item.tag,
            fontSize: fontSize,
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            fill: textColor,
            x: am5.percent(position.x),
            y: am5.percent(position.y),
            centerX: am5.p50,
            centerY: am5.p50,
            interactive: true
          })
        );
        
        // Add a subtle shadow effect to make words stand out more
        label.set("shadowColor", am5.color(0x000000, 0.2));
        label.set("shadowBlur", 3);
        label.set("shadowOffsetX", 1);
        label.set("shadowOffsetY", 1);
      });
      
      // For remaining words, use a spiral layout around the edges
      let angle = 0;
      let radius = 25; // Start radius (percentage of container)
      const angleStep = 0.8; // Larger step to space words further apart
      
      otherWords.forEach((item, index) => {
        // Calculate font size based on weight - smaller for other words
        const minFontSize = 8;
        const maxFontSize = 18;
        const fontRange = maxFontSize - minFontSize;
        const fontSize = minFontSize + (item.weight / maxWeight) * fontRange;
        
        // Calculate position in spiral layout
        angle += angleStep;
        radius += 0.5;
        const x = grid.center.x + radius * Math.cos(angle);
        const y = grid.center.y + radius * Math.sin(angle);
        
        // Get color based on sentiment
        const textColor = getColorBySentiment(item);
        
        // Create word label for other words
        const label = wordCloudContainer.children.push(
          am5.Label.new(root, {
            text: item.tag,
            fontSize: fontSize,
            fontFamily: "Inter, sans-serif",
            fontWeight: "400",
            fill: textColor,
            x: am5.percent(x),
            y: am5.percent(y),
            centerX: am5.p50,
            centerY: am5.p50,
            interactive: true
          })
        );
        
        // Add hover and click effects
        label.states.create("hover", {
          fill: am5.color(0x0984E3),
          scale: 1.1
        });
        
        label.events.on("pointerover", () => {
          label.states.applyAnimate("hover");
        });
        
        label.events.on("pointerout", () => {
          label.states.applyAnimate("default");
        });
        
        label.events.on("click", () => {
          console.log(`Word clicked: ${item.tag}`);
          // Add filtering logic here if needed
        });
      });
    };
    
    // Make container draggable
    wordCloudContainer.set("draggable", true);
    
    // Initial render of words
    renderWords();
    
    // Add zoom functionality to buttons
    zoomIn.events.on("click", () => {
      if (currentScale < maxScale) {
        currentScale *= 1.2;
        wordCloudContainer.animate({
          key: "scale",
          to: currentScale,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });
      }
    });
    
    zoomOut.events.on("click", () => {
      if (currentScale > minScale) {
        currentScale *= 0.8;
        wordCloudContainer.animate({
          key: "scale",
          to: currentScale,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });
      }
    });
    
    // Add mouse wheel zoom
    root.container.set("wheelable", true);
    root.container.events.on("wheel", (ev) => {
      if (ev.originalEvent) {
        const delta = ev.originalEvent.deltaY;
        if (delta < 0 && currentScale < maxScale) {
          // Zoom in
          currentScale = Math.min(currentScale * 1.1, maxScale);
          wordCloudContainer.set("scale", currentScale);
          ev.originalEvent.preventDefault();
        } else if (delta > 0 && currentScale > minScale) {
          // Zoom out
          currentScale = Math.max(currentScale * 0.9, minScale);
          wordCloudContainer.set("scale", currentScale);
          ev.originalEvent.preventDefault();
        }
      }
    });
    
    // Animate words in
    wordCloudContainer.children.each((child) => {
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
      <div ref={chartRef} style={{ width, height }} className="cursor-move" />
    </div>
  );
};

export default WordCloud;