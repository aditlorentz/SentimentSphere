import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Brain, ChartLine, Star, BarChart3, Settings, BarChart2 } from "lucide-react";
import nlpLogo from "../../assets/logo-nlp.webp";
import { useQuery } from "@tanstack/react-query";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
}

const SidebarItem = ({ href, icon, children, badge }: SidebarItemProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <div
        className={cn(
          "sidebar-item",
          isActive && "active"
        )}
      >
        <span className="w-5 text-gray-500">{icon}</span>
        <span className="ml-3">{children}</span>
        {badge && (
          <span className="ml-auto bg-gray-100 text-xs rounded-full px-2 py-1">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
};

interface TopInsightItemProps {
  label: string;
  count: number;
}

const TopInsightItem = ({ label, count }: TopInsightItemProps) => (
  <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
    <span className="truncate"># {label}</span>
    <span className="bg-gray-100 text-xs rounded-full px-2 py-1">{count}</span>
  </div>
);

// Interface untuk format respons API
interface TopWordInsight {
  id: number;
  wordInsight: string;
  totalCount: number;
}

// Hook untuk mengambil data top insights dari API
function useTopWordInsights() {
  return useQuery<TopWordInsight[]>({
    queryKey: ['/api/top-word-insights'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default function Sidebar() {
  // Menggunakan fungsi query untuk mendapatkan data top word insights
  const { data: topWordInsights, isLoading } = useTopWordInsights();
  
  console.log('Top insights in Sidebar:', topWordInsights);

  return (
    <aside className="w-64 bg-white shadow-neu flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-100 flex items-center">
        <img 
          src={nlpLogo} 
          alt="NLP Logo" 
          className="h-10"
        />
        <h1 className="font-display text-xl font-semibold ml-3 text-black">
          NLP Insight
        </h1>
      </div>

      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          MASTER DATA
        </p>
        <nav className="mt-4 space-y-1">
          <SidebarItem href="/my-insights" icon={<ChartLine size={18} />}>
            My Insight
          </SidebarItem>
          <SidebarItem href="/survey-dashboard" icon={<BarChart3 size={18} />}>
            Survey Dashboard
          </SidebarItem>
          <SidebarItem href="/top-insights" icon={<Star size={18} />}>
            Top Insight
          </SidebarItem>
          <SidebarItem href="/smart-analytics" icon={<Brain size={18} />}>
            Smart Analytics
          </SidebarItem>
          <SidebarItem href="/settings" icon={<Settings size={18} />}>
            Settings
          </SidebarItem>
        </nav>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          TOP INSIGHTS
        </p>
        <nav className="mt-4 space-y-1">
          {isLoading ? (
            // Tampilkan loading state saat data sedang dimuat
            <div className="text-center py-4 text-gray-400 text-sm">
              Loading insights...
            </div>
          ) : topWordInsights.length > 0 ? (
            // Tampilkan data jika tersedia
            topWordInsights.map((insight) => (
              <TopInsightItem
                key={insight.id}
                label={insight.wordInsight}
                count={insight.totalCount}
              />
            ))
          ) : (
            // Tampilkan pesan jika tidak ada data
            <div className="text-center py-4 text-gray-400 text-sm">
              No insights available
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
