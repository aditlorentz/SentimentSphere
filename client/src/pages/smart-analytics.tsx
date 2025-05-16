import React, { useEffect, useState } from "react";
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
import { Pagination } from "@/components/ui/pagination";

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
  // State untuk filter
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [wordInsightFilter, setWordInsightFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<any>(undefined);
  
  // State untuk paginasi
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // Options for source filter
  const sourceOptions = [
    { label: "Email HC", value: "Email HC" },
    { label: "Bot HC", value: "Bot HC" },
    { label: "Instagram HC", value: "Instagram HC" },
    { label: "Diarium", value: "Diarium" },
    { label: "Komplain Helpdesk HC", value: "Komplain Helpdesk HC" },
    { label: "Berita HC", value: "Berita HC" }
  ];
  
  // Word Insight options
  const wordInsightOptions = [
    { label: "Program Wellness", value: "Program Wellness" },
    { label: "Fasilitas Kerja", value: "Fasilitas Kerja" },
    { label: "Employee Recognition", value: "Employee Recognition" },
    { label: "Pelatihan Digital", value: "Pelatihan Digital" },
    { label: "Program Mentoring", value: "Program Mentoring" },
    { label: "Flexible Working", value: "Flexible Working" },
    { label: "Penilaian Kinerja", value: "Penilaian Kinerja" },
    { label: "Ruang Kerja", value: "Ruang Kerja" },
    { label: "Kesehatan Mental", value: "Kesehatan Mental" }
  ];
  
  // Handler untuk filter
  const handleSourceChange = (value: string) => {
    setSourceFilter(value);
    setPage(1);
  };

  const handleWordInsightChange = (value: string) => {
    setWordInsightFilter(value);
    setPage(1);
  };

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSourceFilter("all");
    setWordInsightFilter("all");
    setDateRange(undefined);
    setPage(1);
  };
  
  // Query untuk data analytics
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics', sourceFilter, wordInsightFilter, dateRange],
    queryFn: async () => {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      // Add filters if not 'all'
      if (sourceFilter !== 'all') {
        params.append('sourceData', sourceFilter);
      }
      
      if (wordInsightFilter !== 'all') {
        params.append('wordInsight', wordInsightFilter);
      }
      
      // Add date range filter if available
      if (dateRange?.from && dateRange?.to) {
        params.append('from', dateRange.from.toISOString());
        params.append('to', dateRange.to.toISOString());
      }
      
      const response = await fetch(`/api/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      return await response.json();
    },
  });
  
  const analytics = data || {
    totalEmployees: 633,
    totalInsights: 633,
    totalNegative: 293,
    totalPositive: 310,
    monthlyData: [
      {
        name: "Jan",
        positive: 160,
        negative: 110,
        neutral: 180,
      },
      {
        name: "Feb",
        positive: 170,
        negative: 128,
        neutral: 188,
      },
      {
        name: "Mar",
        positive: 175,
        negative: 122,
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
        positive: 310,
        negative: 293,
        neutral: 30,
      },
    ],
    pieData: [
      { name: "Positive", value: 310 },
      { name: "Negative", value: 293 },
      { name: "Neutral", value: 30 },
    ],
    trendInsights: [],
  };

  // Set total pages based on trend insights
  useEffect(() => {
    if (analytics?.trendInsights?.length) {
      setTotalPages(Math.ceil(analytics.trendInsights.length / pageSize));
    }
  }, [analytics?.trendInsights?.length, pageSize]);

  // Colors for pie chart
  const COLORS = ["#00B894", "#FF6B6B", "#54A0FF"];

  // Calculate percentage for each sentiment
  const totalSentiments = analytics.totalPositive + analytics.totalNegative + (analytics.totalInsights - analytics.totalPositive - analytics.totalNegative);
  const positivePercentage = Math.round((analytics.totalPositive / totalSentiments) * 100);
  const negativePercentage = Math.round((analytics.totalNegative / totalSentiments) * 100);
  const neutralPercentage = Math.round(((analytics.totalInsights - analytics.totalPositive - analytics.totalNegative) / totalSentiments) * 100);

  // Paginate trend insights
  const startIndex = (page - 1) * pageSize;
  const paginatedTrendInsights = analytics.trendInsights
    ? analytics.trendInsights.slice(startIndex, startIndex + pageSize)
    : [];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header title="Smart Analytics" />
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-[12px] h-24 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[12px] h-96 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
            <div className="bg-white rounded-[12px] h-96 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Smart Analytics" 
        totalInsights={analytics.totalInsights}
        showFilters={true}
        showSourceFilter={true}
        showDateFilter={true}
        sourceValue={sourceFilter}
        wordInsightValue={wordInsightFilter}
        dateRangeValue={dateRange}
        sourceOptions={sourceOptions}
        wordInsightOptions={wordInsightOptions}
        onSourceChange={handleSourceChange}
        onWordInsightChange={handleWordInsightChange}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={handleResetFilters}
      />
      
      <div className="p-6 space-y-6">
        {/* Metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Karyawan Terlibat</p>
                  <h3 className="text-2xl font-bold text-[#2D3436]">{analytics.totalEmployees}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0984E3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Insights</p>
                  <h3 className="text-2xl font-bold text-[#2D3436]">{analytics.totalInsights}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00B894]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">Sentimen Positif</p>
                  <h3 className="text-2xl font-bold text-[#2D3436]">{positivePercentage}%</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00B894]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">Sentimen Negatif</p>
                  <h3 className="text-2xl font-bold text-[#2D3436]">{negativePercentage}%</h3>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Trend Sentimen Karyawan (Januari - Mei)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B894" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00B894" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#54A0FF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#54A0FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      name="Positif"
                      dataKey="positive"
                      stroke="#00B894"
                      fillOpacity={1}
                      fill="url(#colorPositive)"
                    />
                    <Area
                      type="monotone"
                      name="Negatif"
                      dataKey="negative"
                      stroke="#FF6B6B"
                      fillOpacity={1}
                      fill="url(#colorNegative)"
                    />
                    <Area
                      type="monotone"
                      name="Netral"
                      dataKey="neutral"
                      stroke="#54A0FF"
                      fillOpacity={1}
                      fill="url(#colorNeutral)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Distribusi Sentimen</h3>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Trending Insights Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">TREG Insights Terkini</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Sentimen</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrendInsights.length > 0 ? (
                    paginatedTrendInsights.map((insight) => (
                      <TableRow key={insight.id}>
                        <TableCell>{insight.city}</TableCell>
                        <TableCell>{insight.source}</TableCell>
                        <TableCell>{insight.employee}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              insight.sentiment.toLowerCase().includes("positif") ||
                              insight.sentiment.toLowerCase().includes("positive")
                                ? "bg-green-100 text-green-800"
                                : insight.sentiment.toLowerCase().includes("negatif") ||
                                  insight.sentiment.toLowerCase().includes("negative")
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {insight.sentiment}
                          </span>
                        </TableCell>
                        <TableCell>{insight.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Tidak ada data yang tersedia
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}