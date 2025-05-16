import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_indonesiaLow from '@amcharts/amcharts5-geodata/indonesiaLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface RegionData {
  id: string;
  name: string;
  value: number;
}

interface IndonesiaMapProps {
  data?: RegionData[];
  title?: string;
  width?: string;
  height?: string;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ 
  data = [], 
  title = "Regional Insights", 
  width = '100%', 
  height = '400px' 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useLayoutEffect(() => {
    // Initialize chart only when DOM is ready
    if (!chartRef.current) return;

    // Dispose previous chart if exists
    if (rootRef.current) {
      rootRef.current.dispose();
    }

    // Create root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create the map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        homeZoomLevel: 2,
        homeGeoPoint: { longitude: 118, latitude: -2 }
      })
    );

    // Create polygon series for map
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_indonesiaLow,
        valueField: "value",
        calculateAggregates: true
      })
    );

    // Configure polygon series appearance
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}: {value}",
      interactive: true,
      fill: am5.color(0xEEEEEE),
      strokeWidth: 0.5,
      stroke: am5.color(0xFFFFFF)
    });

    // Create hover state
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x0984E3)
    });

    // Create active state
    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x00B894)
    });

    // Add heat rule
    polygonSeries.set("heatRules", [{
      target: polygonSeries.mapPolygons.template,
      dataField: "value",
      min: am5.color(0xCFE8FF),
      max: am5.color(0x0984E3),
      key: "fill"
    }]);

    // Setup data
    let defaultData;
    if (data.length > 0) {
      // Use provided data
      defaultData = data;
    } else {
      // Use default data
      defaultData = [
        { id: "ID-JK", name: "Jakarta", value: 42 },
        { id: "ID-JB", name: "West Java", value: 35 },
        { id: "ID-JI", name: "East Java", value: 28 },
        { id: "ID-JT", name: "Central Java", value: 25 },
        { id: "ID-SN", name: "South Sulawesi", value: 18 },
        { id: "ID-BT", name: "Banten", value: 15 },
        { id: "ID-SU", name: "North Sumatra", value: 12 },
        { id: "ID-KT", name: "East Kalimantan", value: 10 }
      ];
    }

    // Set polygon data
    polygonSeries.data.setAll(defaultData);

    // Custom adapter to add labels on polygons
    polygonSeries.mapPolygons.template.adapters.add("onHit", function(onHit, target) {
      // Get data item
      const dataItem = target.dataItem;
      
      if (dataItem && dataItem.dataContext) {
        const dataContext = dataItem.dataContext as any;
        const id = dataContext.id;
        const name = dataContext.name;
        const value = dataContext.value;
        
        if (id && name) {
          console.log(`Clicked region: ${name} (${id}), value: ${value}`);
          // Handle click event here (e.g., filter data by region)
        }
      }

      // Toggle active state
      polygonSeries.mapPolygons.each((polygon) => {
        if (polygon !== target) {
          polygon.states.applyAnimate("default");
        }
      });
      
      if (target.get("active")) {
        target.states.applyAnimate("default");
        target.set("active", false);
      } else {
        target.states.applyAnimate("active");
        target.set("active", true);
      }
      
      return onHit;
    });

    // Add labels directly on the polygons
    polygonSeries.mapPolygons.template.setup = (target) => {
      // Create label for the value
      const valueLabel = am5.Label.new(root, {
        text: "{value}",
        fontSize: 14,
        fontWeight: "bold",
        fill: am5.color(0x000000),
        centerX: am5.p50,
        centerY: am5.p50,
        populateText: true,
        background: am5.Circle.new(root, {
          radius: 20,
          fill: am5.color(0xFFFFFF),
          fillOpacity: 0.8,
          stroke: am5.color(0xCCCCCC),
          strokeWidth: 1
        })
      });
      
      // Append the label to the polygon
      target.children.push(valueLabel);
    };

    // Add heat legend
    const heatLegend = chart.children.push(am5.HeatLegend.new(root, {
      orientation: "vertical",
      startColor: am5.color(0xCFE8FF),
      endColor: am5.color(0x0984E3),
      startText: "Lowest",
      endText: "Highest",
      stepCount: 5,
      height: am5.percent(70),
      y: am5.percent(15)
    }));
    
    // Position the legend
    heatLegend.set("x", am5.percent(90));

    // Make stuff animate on load
    chart.appear(1000, 100);

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
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div ref={chartRef} style={{ width, height }} />
    </div>
  );
};

export default IndonesiaMap;