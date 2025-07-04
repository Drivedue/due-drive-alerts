
import DocumentCard from "./DocumentCard";
import EmptyDocumentsState from "./EmptyDocumentsState";

interface DocumentsListProps {
  documents: any[];
  vehicles: any[];
  activeTab: string;
  onAddDocument: () => void;
  onViewDetails: (document: any) => void;
  onEditDocument: (document: any) => void;
}

const DocumentsList = ({
  documents,
  vehicles,
  activeTab,
  onAddDocument,
  onViewDetails,
  onEditDocument
}: DocumentsListProps) => {
  if (documents.length === 0) {
    return (
      <EmptyDocumentsState
        activeTab={activeTab}
        vehicles={vehicles}
        onAddDocument={onAddDocument}
      />
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onViewDetails={onViewDetails}
          onEditDocument={onEditDocument}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
