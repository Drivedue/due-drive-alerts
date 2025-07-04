
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Clock, FileText, Eye, RefreshCw } from "lucide-react";
import DocumentDetailsModal from "./DocumentDetailsModal";

interface DocumentCardProps {
  document: any;
  onViewDetails: (document: any) => void;
  onRenewDocument: (document: any) => void;
}

const DocumentCard = ({ document, onViewDetails, onRenewDocument }: DocumentCardProps) => {
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
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">{document.title}</h3>
            <p className="text-xs text-gray-600">{document.vehiclePlate}</p>
          </div>
          <Badge className={`${getStatusColor(document.status)} flex items-center gap-1`}>
            {getStatusIcon(document.status)}
            {getStatusText(document.status, document.daysLeft)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span>Expires: {document.expiry_date || 'No expiry date'}</span>
          <Calendar className="h-3 w-3" />
        </div>

        <div className="flex gap-2">
          <DocumentDetailsModal document={document} />
          
          <Button 
            size="sm" 
            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
            onClick={() => onRenewDocument(document)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Renew Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
