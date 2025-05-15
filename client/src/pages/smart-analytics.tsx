import { useEffect, useState } from "react";
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
            trendInsights: [
              {
                id: 1,
                city: "Surabaya",
                source: "Dikleum",
                employee: "G*** I***",
                sentiment: "Dengan ini saya ingin mengemukakan kepada manajemen tentang kebijakan baru...",
                date: "2025-05-14 13:56:02",
              },
              {
                id: 2,
                city: "Bandung",
                source: "Dikleum",
                employee: "S*** Y***",
                sentiment: "Program pengembangan karir yang ditawarkan sangat membantu saya...",
                date: "2025-05-14 12:45:19",
              },
              {
                id: 3,
                city: "Jakarta",
                source: "Feedback",
                employee: "A*** B***",
                sentiment: "Sistem kerja hybrid memberikan fleksibilitas yang baik...",
                date: "2025-05-14 11:30:45",
              },
              {
                id: 4,
                city: "Surabaya",
                source: "Dikleum",
                employee: "M*** N***",
                sentiment: "Perlu adanya peningkatan fasilitas kerja di kantor cabang...",
                date: "2025-05-14 10:15:33",
              },
            ],
          });
        }, 500);
      });
    },
  });

  const COLORS = ["#00B894", "#FF7675", "#FDCB6E"];

  if (isLoading) {
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
                  <h3 className="text-2xl font-bold mt-1">{data?.totalEmployees}</h3>
                  <span className="text-green-500 text-sm">+ {data?.totalEmployees}.0% this month</span>
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
                  <h3 className="text-2xl font-bold mt-1">{data?.totalInsights}</h3>
                  <span className="text-green-500 text-sm">+ {data?.totalInsights}.0% this month</span>
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
                  <h3 className="text-2xl font-bold mt-1">{data?.totalNegative}</h3>
                  <span className="text-red-500 text-sm">+ {data?.totalNegative}.0% this month</span>
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
                  <h3 className="text-2xl font-bold mt-1">{data?.totalPositive}</h3>
                  <span className="text-green-500 text-sm">+ {data?.totalPositive}.0% this month</span>
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
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={data?.monthlyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#00B894"
                    fill="#00B894"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#FF7675"
                    fill="#FF7675"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#FDCB6E"
                    fill="#FDCB6E"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                  {data?.trendInsights.map((insight, index) => (
                    <TableRow key={insight.id} className="hover:bg-gray-50 transition-all duration-200">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{insight.city}</TableCell>
                      <TableCell>{insight.source}</TableCell>
                      <TableCell>{insight.employee}</TableCell>
                      <TableCell className="max-w-md truncate">{insight.sentiment}</TableCell>
                      <TableCell>{insight.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Chatbot />
    </div>
  );
}
