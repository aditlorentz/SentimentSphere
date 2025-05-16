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

interface IndonesiaMapSimpleProps {
  data?: RegionData[];
  title?: string;
  width?: string;
  height?: string;
}

const IndonesiaMapSimple: React.FC<IndonesiaMapSimpleProps> = ({ 
  data = [], 
  title = "Regional Distribution", 
  width = '100%', 
  height = '400px'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useLayoutEffect(() => {
    // Pastikan DOM element tersedia
    if (!chartRef.current) return;

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
      tooltipText: "{name}: {value}",
      interactive: true,
      fill: am5.color(0xEEEEEE),
      strokeWidth: 0.5,
      stroke: am5.color(0xFFFFFF)
    });

    // Tambahkan heat rule untuk warna berdasarkan nilai
    polygonSeries.set("heatRules", [{
      target: polygonSeries.mapPolygons.template,
      dataField: "value",
      min: am5.color(0xCFE8FF),
      max: am5.color(0x0984E3),
      key: "fill"
    }]);

    // Siapkan data
    const mapData = data.length > 0 ? data : [
      { id: "ID-JK", name: "Jakarta", value: 42 },
      { id: "ID-JB", name: "West Java", value: 35 },
      { id: "ID-JI", name: "East Java", value: 28 },
      { id: "ID-JT", name: "Central Java", value: 25 },
      { id: "ID-SN", name: "South Sulawesi", value: 18 },
      { id: "ID-BT", name: "Banten", value: 15 },
      { id: "ID-SU", name: "North Sumatra", value: 12 },
      { id: "ID-KT", name: "East Kalimantan", value: 10 }
    ];

    // Terapkan data ke polygon series
    polygonSeries.data.setAll(mapData);

    // Buat point series untuk label angka
    const textSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );

    // Definisikan posisi label untuk setiap provinsi
    const labelPositions: Record<string, {latitude: number, longitude: number}> = {
      "ID-JK": { latitude: -6.2, longitude: 106.8 },  // Jakarta
      "ID-JB": { latitude: -6.9, longitude: 107.6 },  // West Java
      "ID-JI": { latitude: -7.5, longitude: 112.5 },  // East Java
      "ID-JT": { latitude: -7.0, longitude: 110.4 },  // Central Java
      "ID-SN": { latitude: -5.1, longitude: 119.4 },  // South Sulawesi
      "ID-BT": { latitude: -6.1, longitude: 106.1 },  // Banten
      "ID-SU": { latitude: 3.6, longitude: 98.7 },    // North Sumatra
      "ID-KT": { latitude: -0.5, longitude: 117.1 }   // East Kalimantan
    };

    // Buat data untuk text labels
    const pointData = mapData.map(region => {
      const position = labelPositions[region.id] || { latitude: 0, longitude: 0 };
      return {
        title: region.value.toString(),
        latitude: position.latitude,
        longitude: position.longitude
      };
    });

    // Terapkan data ke text series
    textSeries.data.setAll(pointData);

    // Konfigurasi tampilan label
    textSeries.bullets.push(() => {
      const circle = am5.Circle.new(root, {
        radius: 18,
        fill: am5.color(0xFFFFFF),
        fillOpacity: 0.8,
        stroke: am5.color(0xCCCCCC),
        strokeWidth: 1
      });

      const text = am5.Label.new(root, {
        text: "{title}",
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

    // Animasi
    chart.appear(1000, 100);

    return () => {
      // Bersihkan resources saat unmount
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

export default IndonesiaMapSimple;