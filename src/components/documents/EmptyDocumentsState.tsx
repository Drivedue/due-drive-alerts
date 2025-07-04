
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";

interface EmptyDocumentsStateProps {
  activeTab: string;
  vehicles: any[];
  onAddDocument: () => void;
}

const EmptyDocumentsState = ({ activeTab, vehicles, onAddDocument }: EmptyDocumentsStateProps) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-600 text-sm mb-4">
          {activeTab === 'all' 
            ? "You haven't added any documents yet."
            : `No ${activeTab} documents found.`
          }
        </p>
        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-xs">
            Add a vehicle first to create documents for it.
          </p>
        ) : (
          <Button onClick={onAddDocument} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyDocumentsState;
