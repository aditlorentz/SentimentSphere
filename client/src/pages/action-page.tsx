import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/dashboard/chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertTriangle, Clipboard, Activity, TrendingUp, ThumbsUp } from "lucide-react";


interface ActionItem {
  id: number;
  program: string;
  issues: string;
  recommendations: string;
  impact: number; // 1-10
  effort: number; // 1-10
  priority: "high" | "medium" | "low";
  status: "not-started" | "in-progress" | "completed";
}

export default function ActionPage() {
  const [activeTab, setActiveTab] = useState("high");
  
  // Fetch action items from API
  const { data: actionItems, isLoading } = useQuery({
    queryKey: ['/api/action-recommendations'],
    queryFn: async () => {
      // Simulate API call
      return mockActionData;
    }
  });

  // Filter by priority
  const filteredActions = actionItems?.filter(item => 
    activeTab === "all" ? true : item.priority === activeTab
  ) || [];

  // Calculate completion stats
  const totalItems = actionItems?.length || 0;
  const completedItems = actionItems?.filter(item => item.status === "completed").length || 0;
  const inProgressItems = actionItems?.filter(item => item.status === "in-progress").length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Header title="Program Action Plan" totalInsights={actionItems?.length || 0} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-800">Completion Progress</h3>
                <p className="text-gray-500 text-sm mt-1">Overall action items status</p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2.5 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs">Not Started</p>
                  <p className="text-gray-800 font-semibold">{totalItems - completedItems - inProgressItems}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-500 text-xs">In Progress</p>
                  <p className="text-gray-800 font-semibold">{inProgressItems}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-500 text-xs">Completed</p>
                  <p className="text-gray-800 font-semibold">{completedItems}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-800">Impact Distribution</h3>
                <p className="text-gray-500 text-sm mt-1">By expected outcome</p>
              </div>
              <div className="bg-purple-50 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <span className="w-24 text-sm text-gray-500">High Impact</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">65%</span>
              </div>
              
              <div className="flex items-center mb-3">
                <span className="w-24 text-sm text-gray-500">Medium Impact</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">25%</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-24 text-sm text-gray-500">Low Impact</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-teal-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-800">Improvement Potential</h3>
                <p className="text-gray-500 text-sm mt-1">Expected sentiment boost</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <ThumbsUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-800">+15%</p>
                  <p className="text-gray-500 text-xs mt-1">Positive</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-800">-12%</p>
                  <p className="text-gray-500 text-xs mt-1">Negative</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-800">-3%</p>
                  <p className="text-gray-500 text-xs mt-1">Neutral</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
                <p className="text-sm text-teal-800 leading-relaxed">
                  Implementing all high priority recommendations is projected to improve overall sentiment 
                  by 15%, particularly in the areas of workplace facilities and employee recognition.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="high" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-gray-800">
                  AI-Generated Action Recommendations
                </h2>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="high" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">High Priority</TabsTrigger>
                  <TabsTrigger value="medium" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">Medium</TabsTrigger>
                  <TabsTrigger value="low" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Low</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="high" className="m-0">
                <ActionList actions={filteredActions} />
              </TabsContent>
              <TabsContent value="medium" className="m-0">
                <ActionList actions={filteredActions} />
              </TabsContent>
              <TabsContent value="low" className="m-0">
                <ActionList actions={filteredActions} />
              </TabsContent>
              <TabsContent value="all" className="m-0">
                <ActionList actions={filteredActions} />
              </TabsContent>
            </Tabs>
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
  
  const getPriorityBadge = () => {
    switch (action.priority) {
      case "high":
        return <span className="text-xs bg-red-50 text-red-700 py-1 px-2 rounded-full">High Priority</span>;
      case "medium":
        return <span className="text-xs bg-yellow-50 text-yellow-700 py-1 px-2 rounded-full">Medium Priority</span>;
      case "low":
        return <span className="text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded-full">Low Priority</span>;
    }
  };
  
  const handleStatusChange = (newStatus: ActionItem['status']) => {
    setStatus(newStatus);
    // In a real app, you would make an API call here to update the status
  };
  
  return (
    <Card className="border-l-4 shadow-sm transition-all hover:shadow-md" 
      style={{ 
        borderLeftColor: action.priority === 'high' ? '#FCA5A5' : 
                         action.priority === 'medium' ? '#FDE68A' : '#93C5FD' 
      }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getPriorityBadge()}
              {getStatusBadge()}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{action.program}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Current Issues</h4>
                <p className="text-sm text-gray-600">{action.issues}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">AI Recommendations</h4>
                <p className="text-sm text-gray-600">{action.recommendations}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Impact</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-teal-500 rounded-full" 
                      style={{ width: `${action.impact * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{action.impact}/10</span>
                </div>
              </div>
              
              <div>
                <span className="text-xs text-gray-500 block mb-1">Effort</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${action.effort * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{action.effort}/10</span>
                </div>
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

// Mock data for development
const mockActionData: ActionItem[] = [
  {
    id: 1,
    program: "Fasilitas Kerja",
    issues: "Banyak keluhan tentang ruang kerja yang kurang nyaman dan peralatan kantor yang terbatas atau sudah usang, mengakibatkan produktivitas yang menurun.",
    recommendations: "Lakukan audit fasilitas kerja di seluruh kantor dan prioritaskan pembaruan peralatan kerja terutama kursi ergonomis dan komputer. Buat program 'Workplace 2.0' dengan ruang kolaborasi yang lebih baik.",
    impact: 9,
    effort: 7,
    priority: "high",
    status: "not-started"
  },
  {
    id: 2,
    program: "Program Mentoring",
    issues: "Implementasi program mentoring belum merata di semua divisi dan kurangnya struktur formal serta pengukuran efektivitas program.",
    recommendations: "Implementasikan platform mentoring digital dengan sistem matching, jadwal terstruktur, dan metrik kesuksesan yang jelas. Berikan insentif bagi mentor dan pengakuan untuk partisipasi aktif.",
    impact: 8,
    effort: 5,
    priority: "high",
    status: "not-started"
  },
  {
    id: 3,
    program: "Penilaian Kinerja",
    issues: "Sistem penilaian kinerja saat ini dianggap tidak transparan dan subjektif, menimbulkan ketidakpuasan karyawan terutama pada saat evaluasi tahunan.",
    recommendations: "Kembangkan sistem penilaian berbasis OKR (Objectives and Key Results) dengan feedback 360 derajat. Tingkatkan transparansi proses dan tambahkan sesi coaching regular.",
    impact: 8,
    effort: 6,
    priority: "high",
    status: "not-started"
  },
  {
    id: 4,
    program: "Ruang Kerja",
    issues: "Layout kantor yang tidak mendukung kolaborasi dan fokus kerja, serta kurangnya ruang istirahat yang memadai.",
    recommendations: "Redesain ruang kerja dengan konsep activity-based working yang menyediakan area untuk fokus, kolaborasi, dan istirahat. Tambahkan elemen natural dan perbaiki pencahayaan.",
    impact: 7,
    effort: 8,
    priority: "medium",
    status: "not-started"
  },
  {
    id: 5,
    program: "Kesehatan Mental",
    issues: "Peningkatan stres kerja dan kurangnya dukungan untuk kesehatan mental karyawan, terutama di departemen dengan beban kerja tinggi.",
    recommendations: "Luncurkan program kesehatan mental komprehensif dengan akses ke konselor profesional, workshop management stres, dan pelatihan mindfulness. Edukasi manager tentang tanda-tanda stres berlebih.",
    impact: 9,
    effort: 4,
    priority: "medium",
    status: "not-started"
  },
  {
    id: 6,
    program: "Employee Recognition",
    issues: "Program penghargaan karyawan yang tidak konsisten dan kurangnya pengakuan untuk kontribusi non-finansial.",
    recommendations: "Implementasikan platform recognition digital dengan sistem poin yang dapat ditukarkan dengan reward. Adakan Employee Appreciation Day bulanan dengan highlight kontribusi unik karyawan.",
    impact: 7,
    effort: 3,
    priority: "medium",
    status: "in-progress"
  },
  {
    id: 7,
    program: "Program Pensiun",
    issues: "Kurangnya pemahaman karyawan tentang program pensiun dan benefit jangka panjang yang tersedia.",
    recommendations: "Selenggarakan sesi edukasi finansial dan perencanaan pensiun. Buat dashboard personal untuk monitoring status pensiun dan proyeksi benefit. Pertimbangkan opsi pensiun yang lebih fleksibel.",
    impact: 6,
    effort: 4,
    priority: "low",
    status: "not-started"
  },
  {
    id: 8,
    program: "Flexible Working",
    issues: "Kebijakan kerja fleksibel yang belum sepenuhnya diterapkan secara konsisten di semua departemen dan level.",
    recommendations: "Standardisasi kebijakan flexible working dengan panduan jelas. Latih manager untuk mengelola tim remote dengan efektif. Sediakan toolkit productivity untuk remote working.",
    impact: 8,
    effort: 3,
    priority: "low",
    status: "completed"
  }
];