import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  selectedValues = [],
  onValueChange,
  placeholder = "Select options",
  className,
  maxDisplay = 2
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter(v => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const clearAll = () => {
    onValueChange([]);
    setOpen(false);
  };

  const selectAll = () => {
    onValueChange(options.map(option => option.value));
  };

  const displayValues = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    
    if (selectedValues.includes("all")) return "All Topics";
    
    const selected = options.filter(option => 
      selectedValues.includes(option.value)
    );
    
    if (selected.length <= maxDisplay) {
      return selected.map(s => s.label).join(", ");
    }
    
    return `${selected.length} selected`;
  }, [selectedValues, options, maxDisplay, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between min-w-[140px] bg-white border-gray-200 rounded-full shadow-sm pl-3 pr-2 py-1 h-auto",
            className
          )}
        >
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="text-sm truncate">{displayValues}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[220px] p-0" align="start">
        <div className="p-2 flex justify-between items-center border-b">
          <span className="text-sm font-medium">Filter by Topic</span>
          <div className="space-x-1">
            <Button onClick={selectAll} variant="ghost" size="sm" className="h-7 text-xs">Select All</Button>
            <Button onClick={clearAll} variant="ghost" size="sm" className="h-7 text-xs">Clear</Button>
          </div>
        </div>
        <ScrollArea className="h-60">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-md cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                <Checkbox 
                  id={`option-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleSelect(option.value)}
                  className="border-gray-300"
                />
                <label 
                  htmlFor={`option-${option.value}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t flex justify-end">
          <Button 
            size="sm" 
            onClick={() => setOpen(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs rounded-full"
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}