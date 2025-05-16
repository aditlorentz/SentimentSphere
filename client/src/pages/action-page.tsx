import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/dashboard/chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertTriangle, Clipboard, Activity } from "lucide-react";


interface ActionItem {
  id: number;
  program: string;
  issues: string;
  recommendations: string;
  negativeCount: number;
  negativePercentage: number;
  status: "not-started" | "in-progress" | "completed";
}

export default function ActionPage() {
  const [negativePrograms, setNegativePrograms] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Mengambil data untuk program dengan sentiment negatif
    const fetchNegativePrograms = async () => {
      try {
        setIsLoading(true);
        // Dalam kasus nyata, ini akan mengambil data dari API
        // Di sini kita menggunakan data dari query SQL yang kita lihat sebelumnya
        const negativeSentimentData = [
          {
            id: 1,
            program: "Fasilitas Kerja",
            negativeCount: 34,
            negativePercentage: 83,
            issues: "Banyak keluhan tentang ruang kerja yang kurang nyaman dan peralatan kantor yang terbatas atau sudah usang.",
            recommendations: "Lakukan audit fasilitas kerja di seluruh kantor dan prioritaskan pembaruan peralatan kerja. Buat program 'Workplace 2.0' dengan ruang kolaborasi yang lebih baik.",
            status: "not-started" as const
          },
          {
            id: 2,
            program: "Klaim Asuransi",
            negativeCount: 27,
            negativePercentage: 93,
            issues: "Proses klaim asuransi yang rumit dan lambat, serta kurangnya transparansi status klaim.",
            recommendations: "Sederhanakan proses klaim dengan sistem digital yang terintegrasi. Berikan status tracking real-time dan bantuan untuk pengajuan klaim.",
            status: "not-started" as const
          },
          {
            id: 3,
            program: "Sistem Promosi",
            negativeCount: 27,
            negativePercentage: 90,
            issues: "Kurangnya transparansi dalam sistem promosi karyawan dan ketidakjelasan jalur karir.",
            recommendations: "Buat framework promosi yang jelas dengan kriteria spesifik. Adakan sesi konsultasi karir rutin dan publikasikan peluang promosi internal.",
            status: "not-started" as const
          },
          {
            id: 4,
            program: "Penilaian Kinerja",
            negativeCount: 22,
            negativePercentage: 63,
            issues: "Sistem penilaian kinerja saat ini dianggap tidak transparan dan subjektif.",
            recommendations: "Kembangkan sistem penilaian berbasis OKR dengan feedback 360 derajat. Tingkatkan transparansi proses dan tambahkan sesi coaching regular.",
            status: "not-started" as const
          },
          {
            id: 5,
            program: "Ruang Kerja",
            negativeCount: 20,
            negativePercentage: 61,
            issues: "Layout kantor yang tidak mendukung kolaborasi dan fokus kerja, serta kurangnya ruang istirahat.",
            recommendations: "Redesain ruang kerja dengan konsep activity-based working. Tambahkan area untuk fokus, kolaborasi, dan istirahat dengan pencahayaan yang lebih baik.",
            status: "not-started" as const
          },
          {
            id: 6,
            program: "Program Pensiun",
            negativeCount: 17,
            negativePercentage: 56,
            issues: "Kurangnya pemahaman karyawan tentang program pensiun dan benefit jangka panjang.",
            recommendations: "Selenggarakan sesi edukasi finansial dan perencanaan pensiun. Buat dashboard personal untuk monitoring status pensiun dan proyeksi benefit.",
            status: "not-started" as const
          },
          {
            id: 7,
            program: "Flexible Working",
            negativeCount: 15,
            negativePercentage: 41,
            issues: "Kebijakan kerja fleksibel yang belum diterapkan secara konsisten di semua departemen.",
            recommendations: "Standardisasi kebijakan flexible working dengan panduan jelas. Latih manager untuk mengelola tim remote dengan efektif.",
            status: "not-started" as const
          },
          {
            id: 8,
            program: "Pelatihan Digital",
            negativeCount: 13,
            negativePercentage: 33,
            issues: "Program pelatihan digital yang tidak merata dan kurang relevan dengan kebutuhan pekerjaan.",
            recommendations: "Lakukan assessment kebutuhan digital untuk setiap departemen. Kembangkan program pembelajaran yang personalized dan berbasis proyek nyata.",
            status: "not-started" as const
          },
          {
            id: 9,
            program: "Kesehatan Mental",
            negativeCount: 11,
            negativePercentage: 34,
            issues: "Kurangnya dukungan untuk kesehatan mental karyawan, terutama di departemen dengan beban kerja tinggi.",
            recommendations: "Luncurkan program kesehatan mental komprehensif dengan akses ke konselor profesional dan workshop management stres.",
            status: "not-started" as const
          },
          {
            id: 10,
            program: "Employee Recognition",
            negativeCount: 9,
            negativePercentage: 23,
            issues: "Program penghargaan karyawan yang tidak konsisten dan kurangnya pengakuan untuk kontribusi non-finansial.",
            recommendations: "Implementasikan platform recognition digital dengan sistem reward. Adakan Employee Appreciation Day bulanan untuk highlight kontribusi unik.",
            status: "not-started" as const
          }
        ];
        
        setNegativePrograms(negativeSentimentData);
      } catch (error) {
        console.error("Error fetching negative programs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNegativePrograms();
  }, []);



  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Header title="Program Action Plan" totalInsights={negativePrograms?.length || 0} />
      
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-gray-800">
                Rekomendasi Program untuk Sentiment Negatif
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {negativePrograms.map(program => (
                  <ActionItemCard key={program.id} action={program} />
                ))}
                {negativePrograms.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada program dengan sentiment negatif ditemukan.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Chatbot />
    </div>
  );
}

function ActionList({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No action items found for this priority level.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {actions.map(action => (
        <ActionItemCard key={action.id} action={action} />
      ))}
    </div>
  );
}

function ActionItemCard({ action }: { action: ActionItem }) {
  const [status, setStatus] = useState(action.status);
  
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <span className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded-full flex items-center"><Check className="h-3 w-3 mr-1" /> Completed</span>;
      case "in-progress":
        return <span className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded-full flex items-center"><Activity className="h-3 w-3 mr-1" /> In Progress</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Not Started</span>;
    }
  };
  
  const getSentimentBadge = () => {
    // Menentukan warna latar dan teks berdasarkan persentase negatif
    const bgColor = action.negativePercentage >= 80 ? 'bg-red-50' : 
                   action.negativePercentage >= 50 ? 'bg-orange-50' : 'bg-yellow-50';
    const textColor = action.negativePercentage >= 80 ? 'text-red-700' : 
                     action.negativePercentage >= 50 ? 'text-orange-700' : 'text-yellow-700';
    
    return (
      <span className={`text-xs ${bgColor} ${textColor} py-1 px-2 rounded-full`}>
        {action.negativeCount} Negatif ({action.negativePercentage}%)
      </span>
    );
  };
  
  const handleStatusChange = (newStatus: ActionItem['status']) => {
    setStatus(newStatus);
    // In a real app, you would make an API call here to update the status
  };
  
  return (
    <Card className="border-l-4 shadow-sm transition-all hover:shadow-md" 
      style={{ 
        borderLeftColor: action.negativePercentage >= 80 ? '#FCA5A5' : 
                         action.negativePercentage >= 50 ? '#FDBA74' : '#FEF08A' 
      }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSentimentBadge()}
              {getStatusBadge()}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{action.program}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Masalah Saat Ini</h4>
                <p className="text-sm text-gray-600">{action.issues}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Rekomendasi Perbaikan</h4>
                <p className="text-sm text-gray-600">{action.recommendations}</p>
              </div>
            </div>
          </div>
          
          <div className="md:ml-6 mt-4 md:mt-0 flex md:flex-col justify-end items-start md:items-end gap-2">
            <Button 
              size="sm" 
              variant={status === "in-progress" ? "default" : "outline"}
              onClick={() => handleStatusChange("in-progress")}
              className={status === "in-progress" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Mark In Progress
            </Button>
            
            <Button 
              size="sm" 
              variant={status === "completed" ? "default" : "outline"}
              onClick={() => handleStatusChange("completed")}
              className={status === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Mark Complete
            </Button>
            
            <Button size="sm" variant="ghost" className="flex items-center">
              <Clipboard className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

