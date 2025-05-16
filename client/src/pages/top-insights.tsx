import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import AIInsightConclusion from "@/components/dashboard/ai-conclusion";
import Chatbot from "@/components/dashboard/chatbot";
import WordCloud from "@/components/dashboard/word-cloud";
import IndonesiaMapSimple from "@/components/dashboard/indonesia-map-simple";
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
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";

const TopInsights = () => {
  const [page, setPage] = useState(1);
  const [pinned, setPinned] = useState<number[]>([]);
  const [wordCloudSvg, setWordCloudSvg] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data: topInsightsData, isLoading } = useQuery({
    queryKey: ["/api/top-insights"],
    refetchOnWindowFocus: false,
  });

  // Handle pagination
  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle pinning/unpinning of insights
  const togglePin = (id: number) => {
    if (pinned.includes(id)) {
      setPinned(pinned.filter((pinnedId) => pinnedId !== id));
    } else {
      setPinned([...pinned, id]);
    }
  };

  // Load pinned insights from localStorage on mount
  useEffect(() => {
    const savedPinned = localStorage.getItem("pinnedInsights");
    if (savedPinned) {
      setPinned(JSON.parse(savedPinned));
    }
  }, []);

  // Save pinned insights to localStorage when updated
  useEffect(() => {
    localStorage.setItem("pinnedInsights", JSON.stringify(pinned));
  }, [pinned]);

  // Set word cloud SVG
  useEffect(() => {
    if (topInsightsData?.wordCloudSvg) {
      setWordCloudSvg(topInsightsData.wordCloudSvg);
    }
  }, [topInsightsData]);

  // Get data for current page
  const getCurrentPageData = () => {
    if (!topInsightsData?.insights) return [];
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return topInsightsData.insights.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = topInsightsData?.insights
    ? Math.ceil(topInsightsData.insights.length / itemsPerPage)
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Header />

      <main className="container px-4 py-6 max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Top NLP Insights
        </h1>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Word Insights & Regional Distribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <WordCloud 
                  svgContent={wordCloudSvg || ""} 
                  title="Word Cloud Analysis"
                />
              </div>
              <div>
                <IndonesiaMapSimple 
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
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getCurrentPageData().map((insight, index) => (
                      <TableRow key={insight.id}>
                        <TableCell className="text-center font-medium">
                          {(page - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{insight.location}</TableCell>
                        <TableCell>{insight.source}</TableCell>
                        <TableCell>{insight.employee}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-sm ${
                              insight.sentiment === "positive"
                                ? "bg-green-100 text-green-800"
                                : insight.sentiment === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {insight.sentiment}
                          </span>
                        </TableCell>
                        <TableCell>{insight.date}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={pinned.includes(insight.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePin(insight.id)}
                            className={pinned.includes(insight.id) ? "bg-blue-500 text-white" : ""}
                          >
                            <BookmarkIcon className="h-4 w-4 mr-1" />
                            {pinned.includes(insight.id) ? "Pinned" : "Pin"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && onPageChange(page - 1)}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => onPageChange(pageNum)}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < totalPages && onPageChange(page + 1)}
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium text-gray-700 mb-4">
                  AI Analysis
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIInsightConclusion />
                  <Chatbot />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopInsights;