import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, FileText, AlertCircle, CheckCircle, Clock, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";

const Documents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Mock documents data
  const documents = [
    {
      id: 1,
      vehicle: "ABC123",
      type: "Driver's License",
      expiryDate: "2024-08-15",
      daysLeft: 42,
      status: "warning",
      issueDate: "2019-08-15",
      authority: "Lagos State FRSC",
      documentNumber: "LAG123456789"
    },
    {
      id: 2,
      vehicle: "ABC123",
      type: "Vehicle Insurance",
      expiryDate: "2024-12-31",
      daysLeft: 180,
      status: "safe",
      issueDate: "2023-12-31",
      authority: "Leadway Assurance",
      documentNumber: "LW987654321"
    },
    {
      id: 3,
      vehicle: "XYZ789",
      type: "Roadworthiness",
      expiryDate: "2024-07-01",
      daysLeft: -3,
      status: "expired",
      issueDate: "2023-07-01",
      authority: "Lagos State VIO",
      documentNumber: "VIO456789123"
    },
    {
      id: 4,
      vehicle: "DEF456",
      type: "Registration",
      expiryDate: "2025-03-15",
      daysLeft: 245,
      status: "safe",
      issueDate: "2024-03-15",
      authority: "Lagos State VIO",
      documentNumber: "REG789123456"
    }
  ];

  const handleViewDetails = (document: any) => {
    // This would typically open a detailed view or modal
    console.log('Viewing details for document:', document);
  };

  const handleRenewDocument = (document: any) => {
    toast({
      title: "Renewal Process Started",
      description: `Initiating renewal for ${document.type}. You will be redirected to the renewal portal.`,
    });
    
    // Simulate renewal process - in real app, this would redirect to appropriate renewal portal
    setTimeout(() => {
      toast({
        title: "Redirecting...",
        description: "Taking you to the renewal portal.",
      });
    }, 1500);
  };

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
    if (status === 'expired') return 'Expired';
    if (status === 'warning') return `${daysLeft} days left`;
    return 'Valid';
  };

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

  const stats = {
    total: documents.length,
    expired: documents.filter(d => d.status === 'expired').length,
    expiring: documents.filter(d => d.status === 'warning').length,
    valid: documents.filter(d => d.status === 'safe').length
  };

  return (
    <MobileLayout title="Documents">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-gray-600">Expired</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-orange-600">{stats.expiring}</div>
            <div className="text-xs text-gray-600">Expiring</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600">{stats.valid}</div>
            <div className="text-xs text-gray-600">Valid</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="expired" className="text-xs">Expired</TabsTrigger>
          <TabsTrigger value="expiring" className="text-xs">Expiring</TabsTrigger>
          <TabsTrigger value="valid" className="text-xs">Valid</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filterDocuments(activeTab).map((document) => (
              <Card key={document.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{document.type}</h3>
                      <p className="text-xs text-gray-600">{document.vehicle}</p>
                    </div>
                    <Badge className={`${getStatusColor(document.status)} flex items-center gap-1`}>
                      {getStatusIcon(document.status)}
                      {getStatusText(document.status, document.daysLeft)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>Expires: {document.expiryDate}</span>
                    <Calendar className="h-3 w-3" />
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{document.type} Details</DialogTitle>
                          <DialogDescription>
                            Complete information for your {document.type.toLowerCase()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Vehicle</label>
                              <p className="text-sm text-gray-900">{document.vehicle}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Document Type</label>
                              <p className="text-sm text-gray-900">{document.type}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Issue Date</label>
                              <p className="text-sm text-gray-900">{document.issueDate}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                              <p className="text-sm text-gray-900">{document.expiryDate}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Issuing Authority</label>
                            <p className="text-sm text-gray-900">{document.authority}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Document Number</label>
                            <p className="text-sm text-gray-900">{document.documentNumber}</p>
                          </div>
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
                    
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleRenewDocument(document)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Renew Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filterDocuments(activeTab).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 text-sm">
              {activeTab === 'all' 
                ? "You haven't added any documents yet."
                : `No ${activeTab} documents found.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </MobileLayout>
  );
};

export default Documents;
