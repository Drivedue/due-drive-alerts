
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GarageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const GarageSearch = ({ searchQuery, onSearchChange }: GarageSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search vehicles..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white"
      />
    </div>
  );
};

export default GarageSearch;
