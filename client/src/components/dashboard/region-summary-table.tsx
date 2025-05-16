import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RegionSummary {
  witel: string;
  total_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  majority_sentiment: string;
}

interface RegionSummaryTableProps {
  title?: string;
}

const RegionSummaryTable: React.FC<RegionSummaryTableProps> = ({ 
  title = "Wilayah Insights Summary"
}) => {
  // Fetch data dari API
  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ['/api/region-summary'],
    queryFn: async () => {
      const response = await fetch('/api/region-summary');
      if (!response.ok) {
        throw new Error('Failed to fetch region summary data');
      }
      const result = await response.json();
      return result.data as RegionSummary[];
    }
  });

  // Fungsi untuk menentukan warna badge berdasarkan sentimen
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positif':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Negatif':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Netral':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    }
  };

  // Tampilkan loading state
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="p-4 flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading summary data...</div>
        </div>
      </div>
    );
  }

  // Tampilkan error jika ada
  if (error) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="text-red-500">
          Failed to load data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Ringkasan data sentimen berdasarkan wilayah</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Wilayah</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Positif</TableHead>
              <TableHead className="text-center">Negatif</TableHead>
              <TableHead className="text-center">Netral</TableHead>
              <TableHead className="text-center">Sentimen Mayoritas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData && summaryData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.witel}</TableCell>
                <TableCell className="text-center">{row.total_count}</TableCell>
                <TableCell className="text-center">{row.positive_count}</TableCell>
                <TableCell className="text-center">{row.negative_count}</TableCell>
                <TableCell className="text-center">{row.neutral_count}</TableCell>
                <TableCell className="text-center">
                  <Badge className={getSentimentColor(row.majority_sentiment)}>
                    {row.majority_sentiment}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!summaryData || summaryData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data yang tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  // Salah satu contoh dari fungsi komponen ini adalah memberikan gambaran tentang distribusi
  // sentimen berdasarkan wilayah, sehingga bisa melihat area mana yang memiliki 
  // sentimen mayoritas positif atau negatif
};

export default RegionSummaryTable;