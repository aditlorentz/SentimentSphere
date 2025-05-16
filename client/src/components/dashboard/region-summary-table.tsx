import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RegionSummaryTableProps {
  title?: string;
  limit?: number;
}

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  let color = "";
  switch (sentiment) {
    case "positive":
      color = "bg-green-100 text-green-800 border-green-200";
      break;
    case "negative":
      color = "bg-red-100 text-red-800 border-red-200";
      break;
    case "neutral":
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      break;
    default:
      color = "bg-gray-100 text-gray-800 border-gray-200";
  }

  return (
    <Badge
      className={`${color} hover:${color} font-medium px-2 py-1 rounded capitalize`}
      variant="outline"
    >
      {sentiment}
    </Badge>
  );
};

const RegionSummaryTable = ({
  title = "Region Summary",
  limit = 10,
}: RegionSummaryTableProps) => {
  // Fetch region data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/map-geo-data"],
    queryFn: async () => {
      const response = await fetch("/api/map-geo-data");
      if (!response.ok) {
        throw new Error("Failed to fetch region data");
      }
      const result = await response.json();
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="p-4 text-center text-gray-500">Loading data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading region data
        </div>
      </div>
    );
  }

  // Sort data by total count (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Limit the number of rows
  const limitedData = sortedData.slice(0, limit);

  return (
    <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Region</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Positive</TableHead>
              <TableHead>Negative</TableHead>
              <TableHead>Neutral</TableHead>
              <TableHead>Sentiment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limitedData.map((region) => (
              <TableRow key={region.id}>
                <TableCell className="font-medium">{region.name}</TableCell>
                <TableCell>{region.value}</TableCell>
                <TableCell>{region.positiveCount}</TableCell>
                <TableCell>{region.negativeCount}</TableCell>
                <TableCell>{region.neutralCount}</TableCell>
                <TableCell>
                  <SentimentBadge sentiment={region.dominantSentiment} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RegionSummaryTable;