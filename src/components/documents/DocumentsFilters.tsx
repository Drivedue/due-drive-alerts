
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsList from "./DocumentsList";

interface DocumentsFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  documents: any[];
  vehicles: any[];
  onAddDocument: () => void;
  onViewDetails: (document: any) => void;
  onRenewDocument: (document: any) => void;
}

const DocumentsFilters = ({
  activeTab,
  onTabChange,
  documents,
  vehicles,
  onAddDocument,
  onViewDetails,
  onRenewDocument
}: DocumentsFiltersProps) => {
  const filterDocuments = (filter: string) => {
    switch (filter) {
      case 'expired':
        return documents.filter(doc => doc.status === 'expired');
      case 'expiring':
        return documents.filter(doc => doc.status === 'warning');
      case 'valid':
        return documents.filter(doc => doc.status === 'safe');
      default:
        return documents;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
        <TabsTrigger value="expired" className="text-xs">Expired</TabsTrigger>
        <TabsTrigger value="expiring" className="text-xs">Expiring</TabsTrigger>
        <TabsTrigger value="valid" className="text-xs">Valid</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-4">
        <DocumentsList
          documents={filterDocuments(activeTab)}
          vehicles={vehicles}
          activeTab={activeTab}
          onAddDocument={onAddDocument}
          onViewDetails={onViewDetails}
          onRenewDocument={onRenewDocument}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentsFilters;
