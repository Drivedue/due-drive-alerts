
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { Button } from "@/components/ui/button";

interface GarageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  showClearButton?: boolean;
}

const GarageSearch = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search vehicles...",
  showClearButton = true 
}: GarageSearchProps) => {
  const { vibrate } = useHaptics();

  const handleClear = () => {
    vibrate('light');
    onSearchChange('');
  };

  const handleFocus = () => {
    vibrate('light');
  };

  return (
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={handleFocus}
        className="pl-12 pr-12 h-12 bg-white rounded-xl border-gray-200 focus:border-[#0A84FF] focus:ring-[#0A84FF] text-base placeholder:text-gray-500"
        style={{ fontSize: '16px' }} // Prevent zoom on iOS
      />
      {showClearButton && searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
};

export default GarageSearch;
