import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import Chatbot from "@/components/dashboard/chatbot";
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

  const { data: topInsights, isLoading } = useQuery({
    queryKey: ['/api/top-insights', page],
    queryFn: async () => {
      // This would normally be fetched from the API
      return new Promise<{
        insights: TopInsight[];
        totalCount: number;
        wordCloudSvg: string;
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            insights: [
              {
                id: 1,
                location: "Ketapang",
                source: "Bud HC",
                employee: "M*** K***",
                sentiment: "Saya ingin memberika...",
                date: "2024-08-18 22:44:53"
              },
              {
                id: 2,
                location: "Marus",
                source: "Bud HC",
                employee: "S*** P***",
                sentiment: "Berikut adalah tangg...",
                date: "2024-12-01 16:42:00"
              },
              {
                id: 3,
                location: "Tambun",
                source: "HR",
                employee: "V*** S***",
                sentiment: "Dengan berat hati sa...",
                date: "2025-03-28 07:45:56"
              },
              {
                id: 4,
                location: "Bekasi",
                source: "Bud HC",
                employee: "R*** D***",
                sentiment: "Berikut adalah tangg...",
                date: "2025-01-10 23:15:22"
              },
              {
                id: 5,
                location: "Sorong",
                source: "IT",
                employee: "L*** S***",
                sentiment: "Saya ingin menyampai...",
                date: "2025-03-19 22:41:47"
              },
              {
                id: 6,
                location: "Tebing Tinggi",
                source: "Bud HC",
                employee: "J*** A***",
                sentiment: "Saya ingin memberika...",
                date: "2025-02-02 04:12:35"
              }
            ],
            totalCount: 500,
            // Word cloud SVG
            wordCloudSvg: `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="150" font-size="50" text-anchor="middle" fill="#333">program</text>
              <text x="160" y="100" font-size="35" text-anchor="middle" fill="#444">karyawan</text>
              <text x="360" y="180" font-size="25" text-anchor="middle" fill="#555">peserta</text>
              <text x="150" y="200" font-size="28" text-anchor="middle" fill="#666">materi</text>
              <text x="320" y="80" font-size="22" text-anchor="middle" fill="#777">proses</text>
              <text x="100" y="160" font-size="20" text-anchor="middle" fill="#888">evaluasi</text>
              <text x="400" y="130" font-size="18" text-anchor="middle" fill="#999">manajemen</text>
              <text x="200" y="250" font-size="16" text-anchor="middle" fill="#aaa">perusahaan</text>
            </svg>`
          });
        }, 500);
      });
    },
  });

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
            <div className="flex justify-center mb-4">
              {topInsights?.wordCloudSvg && (
                <div dangerouslySetInnerHTML={{ __html: topInsights.wordCloudSvg }} />
              )}
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
