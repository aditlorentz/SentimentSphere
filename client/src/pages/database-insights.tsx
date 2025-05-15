import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface InsightData {
  id: number;
  sourceData: string;
  employeeName: string;
  date: string;
  witel: string;
  kota: string;
  originalInsight: string;
  sentenceInsight: string;
  wordInsight: string;
  sentimen: string;
  createdAt: string;
}

interface InsightStats {
  totalInsights: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  bySource: { source: string; count: number }[];
  byWitel: { witel: string; count: number }[];
  byWord: { word: string; count: number }[];
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case "positif":
      return "bg-green-100 text-green-800";
    case "negatif":
      return "bg-red-100 text-red-800";
    case "netral":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function DatabaseInsights() {
  const [filter, setFilter] = useState<string>("all");

  // Fetch insights with filter
  const { data: insightsData, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["/api/postgres/insights", filter],
    queryFn: async () => {
      const url = filter === "all" 
        ? "/api/postgres/insights" 
        : `/api/postgres/insights?sentimen=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  // Fetch stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/postgres/stats"],
    queryFn: async () => {
      const res = await fetch("/api/postgres/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoadingInsights || isLoadingStats) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Database Insights</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading data...</div>
        </div>
      </div>
    );
  }

  const stats: InsightStats = statsData;
  const insights: { data: InsightData[]; total: number } = insightsData;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInsights}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.positiveCount}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({Math.round((stats.positiveCount / stats.totalInsights) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Negative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.negativeCount}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({Math.round((stats.negativeCount / stats.totalInsights) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Neutral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.neutralCount}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({Math.round((stats.neutralCount / stats.totalInsights) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="insights" className="mb-8">
        <TabsList>
          <TabsTrigger value="insights">Insights Data</TabsTrigger>
          <TabsTrigger value="sources">By Source</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="mt-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Insights Data</h2>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positif">Positive</SelectItem>
                <SelectItem value="negatif">Negative</SelectItem>
                <SelectItem value="netral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Keywords</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.data.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell>{insight.id}</TableCell>
                    <TableCell>{insight.sourceData}</TableCell>
                    <TableCell>{insight.employeeName}</TableCell>
                    <TableCell>
                      {insight.kota}, {insight.witel}
                    </TableCell>
                    <TableCell>
                      {format(new Date(insight.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getSentimentColor(insight.sentimen)}
                        variant="outline"
                      >
                        {insight.sentimen}
                      </Badge>
                    </TableCell>
                    <TableCell>{insight.wordInsight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="sources" className="mt-4">
          <h2 className="text-xl font-bold mb-4">Distribution by Source</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.bySource.map((item) => (
                  <TableRow key={item.source}>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>
                      {Math.round((item.count / stats.totalInsights) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="location" className="mt-4">
          <h2 className="text-xl font-bold mb-4">Distribution by Location</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byWitel.map((item) => (
                  <TableRow key={item.witel}>
                    <TableCell>{item.witel}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>
                      {Math.round((item.count / stats.totalInsights) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="keywords" className="mt-4">
          <h2 className="text-xl font-bold mb-4">Keywords</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byWord.map((item) => (
                  <TableRow key={item.word}>
                    <TableCell>{item.word}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>
                      {Math.round((item.count / stats.totalInsights) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Insight Detail</h2>
        {insights.data.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                {insights.data[0].sourceData} - {insights.data[0].employeeName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className={getSentimentColor(insights.data[0].sentimen)}
                  variant="outline"
                >
                  {insights.data[0].sentimen}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(new Date(insights.data[0].date), "dd MMMM yyyy")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Original Insight
                </h3>
                <p>{insights.data[0].originalInsight}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Sentence Insight
                </h3>
                <p>{insights.data[0].sentenceInsight}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Keywords
                </h3>
                <Badge variant="outline">{insights.data[0].wordInsight}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}