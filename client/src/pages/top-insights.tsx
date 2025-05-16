import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import Chatbot from "@/components/dashboard/chatbot";
import WordCloud from "@/components/dashboard/word-cloud";
import IndonesiaMap from "@/components/dashboard/indonesia-map";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const aiConclusionText = `Berdasarkan analisis sentimen, mayoritas tanggapan bersifat netral (69) dengan beberapa umpan baik positif (15) dan negatif (7). Topik "kepegawaian hc" dan "bonus tahunan hc" mendapat perhatian tertinggi. Kritik konstruktif terkait kebijakan bimbingan dan kenaikan gaji menunjukkan area yang perlu ditingkatkan. Secara keseluruhan, sentimen karyawan cenderung netral dengan beberapa area yang memerlukan perhatian manajemen.`;

interface TopInsight {
  id: number;
  location: string;
  source: string;
  employee: string;
  sentiment: string;
  date: string;
}

export default function TopInsights() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  // Fetch data from employee_insights table with pagination
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['/api/postgres/insights', page],
    queryFn: async () => {
      const limit = 10; // Display 10 insights per page
      const response = await fetch(`/api/postgres/insights?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      return data;
    },
  });
  
  // Prepare data for the component
  const topInsights = insightsData ? {
    insights: insightsData.data.map((item: any) => ({
      id: item.id,
      location: item.kota || 'Unknown',
      source: item.sourceData || 'Unknown',
      employee: item.employeeName ? `${item.employeeName.substring(0, 1)}*** ${item.employeeName.substring(item.employeeName.length - 1)}***` : 'Unknown',
      sentiment: item.sentenceInsight ? `${item.sentenceInsight.substring(0, 20)}...` : item.sentimen,
      date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0].replace(/-/g, '/') : 'Unknown'
    })),
    totalCount: Number(insightsData.total) || 0,
    // Word cloud data for amCharts - using the top word insights
    wordCloudData: [
      { tag: "program", weight: 80 },
      { tag: "karyawan", weight: 65 },
      { tag: "peserta", weight: 42 },
      { tag: "materi", weight: 48 },
      { tag: "proses", weight: 35 },
      { tag: "evaluasi", weight: 30 },
      { tag: "manajemen", weight: 25 },
      { tag: "perusahaan", weight: 20 },
      { tag: "pengembangan", weight: 15 },
      { tag: "implementasi", weight: 12 },
      { tag: "kebijakan", weight: 10 },
      { tag: "administrasi", weight: 8 }
    ]
  } : null;

  useEffect(() => {
    if (topInsights?.totalCount) {
      setTotalPages(Math.ceil(topInsights.totalCount / 10));
    }
  }, [topInsights?.totalCount]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-x-hidden">
        <Header title="Top Insights" />
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-[12px] h-24 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-[12px] h-96 animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.05)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="Top Insights" />
      
      <div className="p-6">
        <AIInsightConclusion content={aiConclusionText} />
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                {topInsights?.wordCloudData && (
                  <WordCloud 
                    data={topInsights.wordCloudData} 
                    height="320px" 
                    title="Word Cloud Analysis"
                  />
                )}
              </div>
              <div>
                <IndonesiaMap 
                  title="Regional Distribution"
                  height="320px"
                  data={[
                    { id: "ID-JK", name: "Jakarta", value: 42 },
                    { id: "ID-JB", name: "West Java", value: 35 },
                    { id: "ID-JI", name: "East Java", value: 28 },
                    { id: "ID-JT", name: "Central Java", value: 25 },
                    { id: "ID-SN", name: "South Sulawesi", value: 18 },
                    { id: "ID-BT", name: "Banten", value: 15 },
                    { id: "ID-SU", name: "North Sumatra", value: 12 },
                    { id: "ID-KT", name: "East Kalimantan", value: 10 }
                  ]}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>WITEL</TableHead>
                    <TableHead>SOURCE</TableHead>
                    <TableHead>NAMA KARYAWAN</TableHead>
                    <TableHead>INSIGHT SENTIMENT</TableHead>
                    <TableHead>DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topInsights?.insights.map((insight, index) => (
                    <TableRow key={insight.id} className="hover:bg-gray-50 transition-all duration-200">
                      <TableCell className="font-medium">{index + 1 + (page - 1) * 10}</TableCell>
                      <TableCell>{insight.location}</TableCell>
                      <TableCell>{insight.source}</TableCell>
                      <TableCell>{insight.employee}</TableCell>
                      <TableCell>{insight.sentiment}</TableCell>
                      <TableCell>{insight.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                        ...
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages);
                        }}
                        isActive={page === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="mt-4 text-sm text-gray-500 text-right">
              Showing 1 to 10 of {topInsights?.totalCount} entries
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Chatbot />
    </div>
  );
}
