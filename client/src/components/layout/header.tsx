import { useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown, RefreshCcw, Calendar as CalendarIcon, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// We've replaced HeaderFilter with more modern Select and Popover components

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [source, setSource] = useState<string>("all");
  const [survey, setSurvey] = useState<string>("all");

  // Date range example (one month ago to now)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-2xl font-display font-bold text-black tracking-tight">{title}</h1>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0 overflow-x-auto pb-2 lg:pb-0">
          {/* Total Insights Counter */}
          <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-full py-1 px-4 shadow-sm border border-blue-200">
            <span className="text-sm font-medium text-blue-800">
              <Layers className="h-4 w-4 inline-block mr-1.5 text-blue-600" />
              Total Insights: {totalInsights}
            </span>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="min-w-[140px] bg-white border-gray-200 rounded-full shadow-sm pl-3 pr-2 py-1 h-auto">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1.5 text-gray-400" />
                  <SelectValue placeholder="Source" className="text-sm" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="min-w-[210px] justify-start bg-white border-gray-200 rounded-full shadow-sm pl-3 pr-2 py-1 h-auto"
              >
                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span className="text-sm font-normal">
                  {date ? format(date, "PPP") : "Pick a date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Survey Type Filter */}
          <div className="relative">
            <Select value={survey} onValueChange={setSurvey}>
              <SelectTrigger className="min-w-[140px] bg-white border-gray-200 rounded-full shadow-sm pl-3 pr-2 py-1 h-auto">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1.5 text-gray-400" />
                  <SelectValue placeholder="Survey" className="text-sm" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surveys</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm rounded-full px-4 py-1 h-8">
            <RefreshCcw className="h-4 w-4 mr-1.5" /> Reset
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-2 ml-auto">
            <Avatar className="h-8 w-8 border-2 border-blue-100">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs">
                T
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-gray-800">Tester</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
