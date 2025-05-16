import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_indonesiaLow from '@amcharts/amcharts5-geodata/indonesiaLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { useQuery } from '@tanstack/react-query';

interface MapGeoDataItem {
  id: string;
  name: string;
  value: number;
  latitude: number;
  longitude: number;
  witel: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  dominantSentiment: string;
}

interface IndonesiaMapProps {
  data?: MapGeoDataItem[];
  title?: string;
  width?: string;
  height?: string;
  useApiData?: boolean;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ 
  data = [], 
  title = "Regional Insights", 
  width = '100%', 
  height = '400px',
  useApiData = true 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  
  // Ambil data dari API jika useApiData = true
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['/api/map-geo-data'],
    queryFn: async () => {
      if (!useApiData) return null;
      
      const response = await fetch('/api/map-geo-data');
      if (!response.ok) {
        throw new Error('Failed to fetch map geo data');
      }
      
      const result = await response.json();
      return result.data as MapGeoDataItem[];
    },
    enabled: useApiData
  });

  // Tentukan data mana yang akan digunakan
  const mapData = useApiData && apiData ? apiData : data;

  useLayoutEffect(() => {
    // Pastikan DOM element tersedia dan ada data
    if (!chartRef.current || (useApiData && isLoading)) return;

    // Bersihkan chart sebelumnya jika ada
    if (rootRef.current) {
      rootRef.current.dispose();
    }

    // Buat root element baru
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set tema animasi
    root.setThemes([am5themes_Animated.new(root)]);

    // Buat chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        homeZoomLevel: 2,
        homeGeoPoint: { longitude: 118, latitude: -2 }
      })
    );

    // Buat polygon series untuk peta dengan GeoJSON
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_indonesiaLow,
        valueField: "value",
        calculateAggregates: true
      })
    );

    // Set tampilan dasar polygon
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}\nTotal: {value}\nPositive: {positiveCount}\nNegative: {negativeCount}\nNeutral: {neutralCount}",
      interactive: true,
      fill: am5.color(0xEEEEEE),
      strokeWidth: 0.5,
      stroke: am5.color(0xFFFFFF)
    });

    // Data default jika tidak ada data
    const defaultData: MapGeoDataItem[] = [
      { id: "ID-JK", name: "Jakarta", value: 42, positiveCount: 25, negativeCount: 10, neutralCount: 7, dominantSentiment: "positive", latitude: -6.2, longitude: 106.8, witel: "Jakarta" },
      { id: "ID-JB", name: "West Java", value: 35, positiveCount: 15, negativeCount: 15, neutralCount: 5, dominantSentiment: "neutral", latitude: -6.9, longitude: 107.6, witel: "Bandung" },
      { id: "ID-JI", name: "East Java", value: 28, positiveCount: 10, negativeCount: 15, neutralCount: 3, dominantSentiment: "negative", latitude: -7.5, longitude: 112.5, witel: "Surabaya" },
      { id: "ID-JT", name: "Central Java", value: 25, positiveCount: 12, negativeCount: 8, neutralCount: 5, dominantSentiment: "positive", latitude: -7.0, longitude: 110.4, witel: "Semarang" },
      { id: "ID-SN", name: "South Sulawesi", value: 18, positiveCount: 5, negativeCount: 10, neutralCount: 3, dominantSentiment: "negative", latitude: -5.1, longitude: 119.4, witel: "Makassar" },
      { id: "ID-BT", name: "Banten", value: 15, positiveCount: 7, negativeCount: 5, neutralCount: 3, dominantSentiment: "positive", latitude: -6.1, longitude: 106.1, witel: "Serang" }
    ];

    // Pilih data yang akan digunakan
    const dataToUse = mapData.length > 0 ? mapData : defaultData;

    // Terapkan data ke polygon series
    polygonSeries.data.setAll(dataToUse);

    // Siapkan rules untuk heatmap berdasarkan sentimen
    const positivePolygons = am5map.MapPolygonSeries.new(root, {});
    const negativePolygons = am5map.MapPolygonSeries.new(root, {});
    const neutralPolygons = am5map.MapPolygonSeries.new(root, {});
    
    positivePolygons.mapPolygons.template.setAll({
      fill: am5.color(0x00B894),  // Hijau
      fillOpacity: 0.7
    });
    
    negativePolygons.mapPolygons.template.setAll({
      fill: am5.color(0xE74C3C),  // Merah
      fillOpacity: 0.7
    });
    
    neutralPolygons.mapPolygons.template.setAll({
      fill: am5.color(0xF1C40F),  // Kuning
      fillOpacity: 0.7
    });
    
    // Kelompokkan data berdasarkan sentimen
    const positiveData: MapGeoDataItem[] = [];
    const negativeData: MapGeoDataItem[] = [];
    const neutralData: MapGeoDataItem[] = [];
    
    dataToUse.forEach(item => {
      if (item.dominantSentiment === "positive") {
        positiveData.push(item);
      } else if (item.dominantSentiment === "negative") {
        negativeData.push(item);
      } else if (item.dominantSentiment === "neutral") {
        neutralData.push(item);
      }
    });
    
    // Terapkan data ke masing-masing series
    positivePolygons.data.setAll(positiveData);
    negativePolygons.data.setAll(negativeData);
    neutralPolygons.data.setAll(neutralData);
    
    // Tambahkan series ke chart
    chart.series.push(positivePolygons);
    chart.series.push(negativePolygons);
    chart.series.push(neutralPolygons);

    // Buat point series untuk label angka
    const textSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        latitudeField: "latitude",
        longitudeField: "longitude"
      })
    );

    // Konfigurasi tampilan label
    textSeries.bullets.push(() => {
      // Buat circle background
      const circle = am5.Circle.new(root, {
        radius: 18,
        fill: am5.color(0xFFFFFF),
        fillOpacity: 0.8,
        stroke: am5.color(0xCCCCCC),
        strokeWidth: 1
      });

      // Buat text untuk nilai
      const text = am5.Label.new(root, {
        text: "{value}",
        fontWeight: "bold",
        fill: am5.color(0x000000),
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: 14
      });

      // Bungkus circle dan text dalam container
      const container = am5.Container.new(root, {});
      container.children.push(circle);
      container.children.push(text);

      return am5.Bullet.new(root, {
        sprite: container
      });
    });

    // Terapkan data ke text series
    textSeries.data.setAll(dataToUse);

    // Tambahkan legend untuk sentimen
    const legend = chart.children.push(
      am5.Legend.new(root, {
        x: am5.p50,
        centerX: am5.p50,
        y: am5.percent(95),
        layout: root.horizontalLayout
      })
    );

    legend.data.setAll([
      { name: "Positive", fill: am5.color(0x00B894) },
      { name: "Neutral", fill: am5.color(0xF1C40F) },
      { name: "Negative", fill: am5.color(0xE74C3C) }
    ]);

    // Animasi
    chart.appear(1000, 100);

    return () => {
      // Bersihkan resources saat unmount
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, [mapData, isLoading, useApiData]);

  return (
    <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      {isLoading && useApiData ? (
        <div className="flex items-center justify-center" style={{ width, height }}>
          <div className="animate-pulse text-gray-400">Loading map data...</div>
        </div>
      ) : (
        <div ref={chartRef} style={{ width, height }} />
      )}
    </div>
  );
};

export default IndonesiaMap;