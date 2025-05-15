import React, { useLayoutEffect, useRef, useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface WordCloudProps {
  data: Array<{
    tag: string;
    weight: number;
  }>;
  width?: string;
  height?: string;
  title?: string;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  data, 
  width = '100%', 
  height = '300px',
  title = "Common Topics"
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useLayoutEffect(() => {
    // Initialize chart only if we have data and DOM is ready
    if (!data || !chartRef.current) return;

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

    // Function to distribute words in a cloud-like pattern
    const renderWords = () => {
      // Clear existing words
      container.children.clear();
      
      // Sort by weight to place more important words first
      const sortedData = [...data].sort((a, b) => b.weight - a.weight);
      
      // Set positions in a circular pattern
      sortedData.forEach((item, index) => {
        // Calculate font size based on weight
        const minSize = 10;
        const maxSize = 36;
        const range = maxSize - minSize;
        const maxWeight = Math.max(...data.map(item => item.weight));
        const fontSize = minSize + (item.weight / maxWeight) * range;
        
        // Calculate position (spiral-like arrangement)
        const angle = index * 0.35; // Controls spiral tightness
        const radius = index * 3; // Controls spiral size
        const x = Math.cos(angle) * radius + 50; // Center x percentage
        const y = Math.sin(angle) * radius + 50; // Center y percentage
        
        // Create a text element for the word
        const label = container.children.push(
          am5.Label.new(root, {
            x: am5.percent(x),
            y: am5.percent(y),
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            text: item.tag,
            fontSize: fontSize,
            fill: am5.color(0x333333 + (index * 111111) % 0xCCCCCC), // Vary color
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
          label.set("fill", am5.color(0x333333 + (index * 111111) % 0xCCCCCC));
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
  }, [data]);

  return (
    <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">Common Topics</h3>
      </div>
      <div ref={chartRef} style={{ width, height }} />
    </div>
  );
};

export default WordCloud;