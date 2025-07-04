
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

interface DocumentDetailsModalProps {
  document: any;
}

const DocumentDetailsModal = ({ document }: DocumentDetailsModalProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'safe':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string, daysLeft: number) => {
    if (status === 'expired') return `Expired ${Math.abs(daysLeft)} days ago`;
    if (status === 'warning') return `${daysLeft} days left`;
    if (status === 'safe') return 'Valid';
    return 'Unknown';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{document.title} Details</DialogTitle>
          <DialogDescription>
            Complete information for your {document.title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle</label>
              <p className="text-sm text-gray-900">{document.vehiclePlate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Document Type</label>
              <p className="text-sm text-gray-900">{document.document_type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Created Date</label>
              <p className="text-sm text-gray-900">{new Date(document.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Expiry Date</label>
              <p className="text-sm text-gray-900">{document.expiry_date || 'No expiry date'}</p>
            </div>
          </div>
          {document.notes && (
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <p className="text-sm text-gray-900">{document.notes}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Badge className={`${getStatusColor(document.status)} mt-1`}>
              {getStatusIcon(document.status)}
              {getStatusText(document.status, document.daysLeft)}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailsModal;
