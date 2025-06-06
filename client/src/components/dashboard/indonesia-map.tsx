import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_indonesiaLow from '@amcharts/amcharts5-geodata/indonesiaLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface RegionData {
  id: string;
  name: string;
  value: number;
  fill?: am5.Color;
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
    const hoverState = polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x0984E3)
    });

    // Create active state
    const activeState = polygonSeries.mapPolygons.template.states.create("active", {
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

    // Add events to polygons
    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      
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
        if (polygon !== ev.target) {
          polygon.states.applyAnimate("default");
        }
      });
      
      if (ev.target.get("active")) {
        ev.target.states.applyAnimate("default");
        ev.target.set("active", false);
      } else {
        ev.target.states.applyAnimate("active");
        ev.target.set("active", true);
      }
    });

    // Create a legend if there's data
    if (data.length > 0) {
      // Set up data
      const regionData = data.map(region => {
        return {
          id: region.id,
          name: region.name,
          value: region.value,
          fill: region.fill
        };
      });
      
      polygonSeries.data.setAll(regionData);
      
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
    } else {
      // Default data with minimal values
      const defaultData = [
        { id: "ID-JK", name: "Jakarta", value: 42 },
        { id: "ID-JB", name: "West Java", value: 35 },
        { id: "ID-JI", name: "East Java", value: 28 },
        { id: "ID-JT", name: "Central Java", value: 25 },
        { id: "ID-SN", name: "South Sulawesi", value: 18 },
        { id: "ID-BT", name: "Banten", value: 15 },
        { id: "ID-SU", name: "North Sumatra", value: 12 },
        { id: "ID-KT", name: "East Kalimantan", value: 10 }
      ];
      
      polygonSeries.data.setAll(defaultData);
    }

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