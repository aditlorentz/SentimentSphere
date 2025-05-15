import { useLocation } from "wouter";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface HeaderFilterProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const HeaderFilter = ({ label, icon, onClick }: HeaderFilterProps) => (
  <div className="relative">
    <button
      className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary flex items-center space-x-2 shadow-sm"
      onClick={onClick}
    >
      <span>{label}</span>
      {icon}
    </button>
  </div>
);

interface HeaderProps {
  title: string;
  totalInsights?: number;
  showFilters?: boolean;
}

export default function Header({
  title,
  totalInsights = 101,
  showFilters = true,
}: HeaderProps) {
  const [location] = useLocation();

  // Date range example (one month ago to now)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const dateRangeStr = `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-2xl font-display font-bold text-black tracking-tight">{title}</h1>

      {showFilters && (
        <div className="flex items-center space-x-2 mt-4 lg:mt-0 overflow-x-auto pb-2 lg:pb-0">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="px-3 text-sm text-gray-500">
              Total Insight: {totalInsights}
            </span>
          </div>

          <HeaderFilter
            label="All Source"
            icon={<ChevronDown className="h-4 w-4 text-gray-400" />}
          />

          <HeaderFilter
            label={dateRangeStr}
            icon={<ChevronDown className="h-4 w-4 text-gray-400" />}
          />

          <HeaderFilter
            label="All Survey"
            icon={<ChevronDown className="h-4 w-4 text-gray-400" />}
          />

          <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-sm transition-all duration-300 ease flex gap-2">
            <RefreshCcw className="h-4 w-4" /> Reset
          </Button>

          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                T
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Tester</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
    </header>
  );
}
