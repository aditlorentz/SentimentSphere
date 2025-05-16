import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Chatbot from "@/components/dashboard/chatbot";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  totalEmployees: number;
  totalInsights: number;
  totalNegative: number;
  totalPositive: number;
  monthlyData: Array<{
    name: string;
    positive: number;
    negative: number;
    neutral: number;
  }>;
  pieData: Array<{
    name: string;
    value: number;
  }>;
  trendInsights: Array<{
    id: number;
    city: string;
    source: string;
    employee: string;
    sentiment: string;
    date: string;
  }>;
}

export default function SmartAnalytics() {
  // Query untuk data analytics dasar
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      // This would normally be fetched from the API
      return new Promise<AnalyticsData>((resolve) => {
        setTimeout(() => {
          resolve({
            totalEmployees: 373,
            totalInsights: 500,
            totalNegative: 118,
            totalPositive: 194,
            monthlyData: [
              {
                name: "Jan",
                positive: 160,
                negative: 110,
                neutral: 180,
              },
              {
                name: "Feb",
                positive: 165,
                negative: 112,
                neutral: 185,
              },
              {
                name: "Mar",
                positive: 170,
                negative: 115,
                neutral: 190,
              },
              {
                name: "Apr",
                positive: 180,
                negative: 116,
                neutral: 192,
              },
              {
                name: "May",
                positive: 194,
                negative: 118,
                neutral: 188,
              },
            ],
            pieData: [
              { name: "Positive", value: 194 },
              { name: "Negative", value: 118 },
              { name: "Neutral", value: 188 },
            ],
            trendInsights: [],  // Akan diisi dari API employee_insights
          });
        }, 500);
      });
    },
  });
  
  // State untuk paginasi
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Query untuk data employee insights dengan paginasi
  const { data: employeeInsightsResponse, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['/api/postgres/insights', page],
    queryFn: async () => {
      const response = await fetch(`/api/postgres/insights?page=${page}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee insights');
      }
      const result = await response.json();
      return result;
    },
  });
  
  // Extract data dan total count untuk paginasi
  const employeeInsightsData = employeeInsightsResponse?.data || [];
  const totalInsights = employeeInsightsResponse?.total || 0;
  const totalPages = Math.ceil(totalInsights / pageSize);
  
  // Query untuk data statistik sentiment
  const { data: sentimentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/postgres/stats'],
    queryFn: async () => {
      const response = await fetch('/api/postgres/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment statistics');
      }
      const result = await response.json();
      return result;
    },
  });

  const COLORS = ["#00B894", "#FF7675", "#FDCB6E"];

  // Mengolah data employee insights untuk Top TREG Insights
  const processedTrendInsights = useMemo(() => {
    if (!employeeInsightsData) return [];
    
    return employeeInsightsData.map((insight: any) => {
      // Pastikan lokasi tidak "Unknown" jika kosong
      let location = insight.location;
      if (!location || location.trim() === '' || location === 'Unknown') {
        // Jika tidak ada lokasi, coba pakai regional atau witel jika ada
        location = insight.regional || insight.witel || "TREG";
      }
      
      return {
        id: insight.id,
        city: location,
        source: insight.sourceData || "N/A",
        employee: insight.employeeName || "Anonymous",
        sentiment: insight.sentimentText || insight.wordInsight || "N/A",
        date: new Date(insight.createdAt).toLocaleString('id-ID')
      };
    });
  }, [employeeInsightsData]);
  
  // Persiapkan data untuk pie chart dari data statistik
  const pieChartData = useMemo(() => {
    if (!sentimentStats) return [];
    
    return [
      { name: "Positive", value: sentimentStats.positiveCount || 0 },
      { name: "Negative", value: sentimentStats.negativeCount || 0 },
      { name: "Neutral", value: sentimentStats.neutralCount || 0 }
    ];
  }, [sentimentStats]);
  
  // Hitung jumlah karyawan unik dari data employee insights
  const uniqueEmployeesCount = useMemo(() => {
    if (!employeeInsightsData || employeeInsightsData.length === 0) return 0;
    
    // Set untuk menyimpan nama karyawan yang unik
    const uniqueEmployees = new Set<string>();
    
    // Iterasi data untuk mengekstrak nama karyawan
    employeeInsightsData.forEach((insight: any) => {
      if (insight.employeeName && insight.employeeName.trim() !== '' && insight.employeeName !== 'Anonymous') {
        uniqueEmployees.add(insight.employeeName);
      }
    });
    
    return uniqueEmployees.size;
  }, [employeeInsightsData]);
  
  if (isLoading || isLoadingInsights) {
    return (
      <div className="flex-1 overflow-x-hidden">
        <Header title="Smart Analytics" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[12px] h-24 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-[12px] h-64 col-span-2 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
            <div className="bg-white rounded-[12px] h-64 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          </div>
          
          <div className="bg-white rounded-[12px] h-64 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="Smart Analytics" />
      
      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-primary">
                  AI Instant Conclusion
                </h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                  AI
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Berdasarkan analisis sentimen, mayoritas tanggapan bersifat netral (69) dengan beberapa umpan baik positif (15) dan negatif (7). Topik "kepegawaian hc" dan "bonus tahunan hc" mendapat perhatian tertinggi. Kritik konstruktif terkait kebijakan bimbingan dan kenaikan gaji menunjukkan area yang perlu ditingkatkan. Secara keseluruhan, sentimen karyawan cenderung netral dengan beberapa area yang memerlukan perhatian manajemen.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="flex items-center bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Karyawan Terlibat</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {isLoadingInsights ? (
                      <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      uniqueEmployeesCount
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex items-center bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Insights</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      sentimentStats?.totalInsights || 0
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                    <path d="M9 18h6"/>
                    <path d="M10 22h4"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex items-center bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Negatif</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      sentimentStats?.negativeCount || 0
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-down">
                    <path d="M17 14V2"/>
                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex items-center bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Positif</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      sentimentStats?.positiveCount || 0
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up">
                    <path d="M7 10v12"/>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="col-span-2 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md">+</button>
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md">-</button>
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </button>
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list">
                    <line x1="8" x2="21" y1="6" y2="6"/>
                    <line x1="8" x2="21" y1="12" y2="12"/>
                    <line x1="8" x2="21" y1="18" y2="18"/>
                    <line x1="3" x2="3" y1="6" y2="6"/>
                    <line x1="3" x2="3" y1="12" y2="12"/>
                    <line x1="3" x2="3" y1="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="py-1 px-2">
                  <h3 className="text-base font-semibold mx-4 my-3 text-gray-800">Sentiment Trends Over Time</h3>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={data?.monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B894" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00B894" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7675" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF7675" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FDCB6E" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FDCB6E" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dx={-5}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: 'none',
                        padding: '10px 14px',
                      }}
                      itemStyle={{ 
                        fontSize: '12px',
                        padding: '2px 0',
                      }}
                      labelStyle={{
                        fontWeight: 'bold',
                        marginBottom: '5px',
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        paddingBottom: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      name="Positive"
                      stackId="1"
                      stroke="#00B894"
                      strokeWidth={2}
                      fill="url(#colorPositive)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      name="Negative"
                      stackId="1"
                      stroke="#FF7675"
                      strokeWidth={2}
                      fill="url(#colorNegative)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="neutral"
                      name="Neutral"
                      stackId="1"
                      stroke="#FDCB6E"
                      strokeWidth={2}
                      fill="url(#colorNeutral)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="py-1 px-2">
                  <h3 className="text-base font-semibold mx-4 my-3 text-gray-800">Sentiment Distribution</h3>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="shadow" height="200%" width="200%" x="-50%" y="-50%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
                      </filter>
                      <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#27ae60" />
                        <stop offset="100%" stopColor="#00B894" />
                      </linearGradient>
                      <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e74c3c" />
                        <stop offset="100%" stopColor="#FF7675" />
                      </linearGradient>
                      <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f39c12" />
                        <stop offset="100%" stopColor="#FDCB6E" />
                      </linearGradient>
                    </defs>
                    {isLoadingStats ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-gray-400">Loading sentiment data...</div>
                      </div>
                    ) : (
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={5}
                        cornerRadius={5}
                        label={({ name, percent }) => {
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {pieChartData.map((entry, index) => {
                          const gradientId = 
                            entry.name === "Positive" ? "positiveGradient" : 
                            entry.name === "Negative" ? "negativeGradient" : "neutralGradient";
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#${gradientId})`} 
                              stroke="#fff"
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}
                            />
                          );
                        })}
                      </Pie>
                    )}
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: 'none',
                        padding: '10px 14px',
                      }}
                      formatter={(value, name) => {
                        const total = sentimentStats?.totalInsights || 0;
                        const percentage = total > 0 ? ((value as number) / total * 100).toFixed(1) : "0.0";
                        return [`${value} (${percentage}%)`, name];
                      }}
                      itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => {
                        return <span style={{ fontSize: '13px', color: '#4b5563', padding: '0 8px' }}>{value}</span>;
                      }}
                      wrapperStyle={{ paddingTop: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Top TREG Insight</h3>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Witel</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Name Karyawan</TableHead>
                    <TableHead>Insight Sentiment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInsights ? (
                    // Loading state - menampilkan 5 baris skeleton loading
                    Array(5).fill(0).map((_, index: number) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell>
                          <div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="w-28 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="w-40 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="w-28 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : processedTrendInsights.length > 0 ? (
                    // Data dari employee insights
                    processedTrendInsights.map((insight: any, index: number) => (
                      <TableRow key={insight.id} className="hover:bg-gray-50 transition-all duration-200">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{insight.city}</TableCell>
                        <TableCell>{insight.source}</TableCell>
                        <TableCell>{insight.employee}</TableCell>
                        <TableCell className="max-w-md truncate">{insight.sentiment}</TableCell>
                        <TableCell>{insight.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No data state
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        Tidak ada data insight tersedia
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {!isLoadingInsights && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Menampilkan {employeeInsightsData.length} dari {totalInsights} data
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className={`px-3 py-1 rounded border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-800'}`}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {/* Create page buttons with logic to show limited range */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        // Calculate which page numbers to show
                        let pageNum = 1;
                        
                        if (totalPages <= 5) {
                          // If 5 or less pages, show all
                          pageNum = idx + 1;
                        } else if (page <= 3) {
                          // Near start
                          pageNum = idx + 1;
                        } else if (page >= totalPages - 2) {
                          // Near end
                          pageNum = totalPages - 4 + idx;
                        } else {
                          // In middle
                          pageNum = page - 2 + idx;
                        }
                        
                        return (
                          <button
                            key={`page-${pageNum}`}
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50 text-gray-800 border'
                            }`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className={`px-3 py-1 rounded border ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-800'}`}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Chatbot />
    </div>
  );
}
