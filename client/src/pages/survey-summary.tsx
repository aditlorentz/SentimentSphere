import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interface for survey dashboard summary item
interface SurveyDashboardSummaryItem {
  id: number;
  wordInsight: string;
  totalCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for API response
interface SurveyDashboardSummaryResponse {
  data: SurveyDashboardSummaryItem[];
  total: number;
}

export default function SurveySummaryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const queryClient = useQueryClient();
  
  // Query to fetch summary data
  const { data: summaryData, isLoading, error } = useQuery<SurveyDashboardSummaryResponse>({
    queryKey: ["/api/survey-dashboard/summary", page, limit],
    queryFn: () => fetch(`/api/survey-dashboard/summary?page=${page}&limit=${limit}`).then(res => res.json()),
  });
  
  // Mutation to generate summary data
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/survey-dashboard/generate', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the summary data
      queryClient.invalidateQueries({ queryKey: ["/api/survey-dashboard/summary"] });
    },
  });
  
  // Calculate percentage for positive, negative, and neutral
  const calculatePercentage = (count: number, total: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };
  
  return (
    <div className="flex-1 overflow-x-hidden">
      <Header title="Survey Dashboard Summary" />
      
      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>WordInsight Summary Table</CardTitle>
            <CardDescription>
              This table shows a summary of WordInsights from employee_insights grouped by sentiment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <Button 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? "Generating..." : "Generate/Refresh Summary Data"}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">Loading summary data...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">Error loading summary data</div>
            ) : summaryData && summaryData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WordInsight</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Positive</TableHead>
                      <TableHead className="text-right">Negative</TableHead>
                      <TableHead className="text-right">Neutral</TableHead>
                      <TableHead>Sentiment Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryData.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.wordInsight}</TableCell>
                        <TableCell className="text-right">{item.totalCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="font-semibold">{item.positiveCount}</span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {calculatePercentage(item.positiveCount, item.totalCount)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="font-semibold">{item.negativeCount}</span>
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {calculatePercentage(item.negativeCount, item.totalCount)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="font-semibold">{item.neutralCount}</span>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {calculatePercentage(item.neutralCount, item.totalCount)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="flex h-2.5 rounded-full">
                              <div
                                className="bg-green-500 h-2.5 rounded-l-full"
                                style={{ width: `${calculatePercentage(item.positiveCount, item.totalCount)}%` }}
                              ></div>
                              <div
                                className="bg-red-500 h-2.5"
                                style={{ width: `${calculatePercentage(item.negativeCount, item.totalCount)}%` }}
                              ></div>
                              <div
                                className="bg-yellow-500 h-2.5 rounded-r-full"
                                style={{ width: `${calculatePercentage(item.neutralCount, item.totalCount)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p>No summary data available. Click the Generate button to create summary data.</p>
              </div>
            )}
            
            {summaryData && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {summaryData.data.length} of {summaryData.total} items
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}