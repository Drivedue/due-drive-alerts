
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowLeft, Search, Filter, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Documents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock documents data
  const allDocuments = [
    {
      id: 1,
      vehicle: "Honda Civic",
      plate: "ABC-123",
      type: "Roadworthiness",
      expiry: "2024-07-20",
      daysLeft: 17,
      status: "urgent"
    },
    {
      id: 2,
      vehicle: "Honda Civic",
      plate: "ABC-123",
      type: "License",
      expiry: "2024-08-15",
      daysLeft: 42,
      status: "warning"
    },
    {
      id: 3,
      vehicle: "Honda Civic",
      plate: "ABC-123",
      type: "Insurance",
      expiry: "2024-12-31",
      daysLeft: 180,
      status: "safe"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'safe': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'urgent') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Calendar className="h-4 w-4" />;
  };

  // Filter documents based on search and filters
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group documents by status
  const urgentDocs = filteredDocuments.filter(doc => doc.status === 'urgent');
  const warningDocs = filteredDocuments.filter(doc => doc.status === 'warning');
  const safeDocs = filteredDocuments.filter(doc => doc.status === 'safe');

  const documentTypes = [...new Set(allDocuments.map(doc => doc.type))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Overview</h1>
              <p className="text-gray-600">Track all your vehicle documents in one place</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles or documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{urgentDocs.length}</div>
              <p className="text-sm text-red-600">Expiring within 30 days</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                <Calendar className="h-5 w-5" />
                Warning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{warningDocs.length}</div>
              <p className="text-sm text-orange-600">Expiring within 60 days</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Calendar className="h-5 w-5" />
                Safe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{safeDocs.length}</div>
              <p className="text-sm text-green-600">Valid for 60+ days</p>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-6">
          {/* Urgent Documents */}
          {urgentDocs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Urgent - Expiring Soon
              </h2>
              <div className="grid gap-4">
                {urgentDocs.map((doc) => (
                  <Card key={doc.id} className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.vehicle} ({doc.plate})</h3>
                            <p className="text-gray-600">{doc.type}</p>
                            <p className="text-sm text-gray-500">Expires: {doc.expiry}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.daysLeft} days left
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              Renew Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Warning Documents */}
          {warningDocs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Warning - Attention Needed
              </h2>
              <div className="grid gap-4">
                {warningDocs.map((doc) => (
                  <Card key={doc.id} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.vehicle} ({doc.plate})</h3>
                            <p className="text-gray-600">{doc.type}</p>
                            <p className="text-sm text-gray-500">Expires: {doc.expiry}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.daysLeft} days left
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline">
                              Plan Renewal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Safe Documents */}
          {safeDocs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Safe - Up to Date
              </h2>
              <div className="grid gap-4">
                {safeDocs.map((doc) => (
                  <Card key={doc.id} className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.vehicle} ({doc.plate})</h3>
                            <p className="text-gray-600">{doc.type}</p>
                            <p className="text-sm text-gray-500">Expires: {doc.expiry}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.daysLeft} days left
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {filteredDocuments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Add your first vehicle to start tracking documents"
                }
              </p>
              <Button onClick={() => navigate('/vehicles')} className="bg-blue-600 hover:bg-blue-700">
                Manage Vehicles
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Documents;
