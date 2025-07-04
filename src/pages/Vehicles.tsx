
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Vehicles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "Honda Civic",
      plate: "ABC-123",
      documents: [
        { type: "License", expiry: "2024-08-15", daysLeft: 42, status: "warning" },
        { type: "Insurance", expiry: "2024-12-31", daysLeft: 180, status: "safe" },
        { type: "Roadworthiness", expiry: "2024-07-20", daysLeft: 17, status: "urgent" }
      ]
    }
  ]);

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate: ''
  });

  const [newDocument, setNewDocument] = useState({
    vehicleId: '',
    type: '',
    expiry: ''
  });

  const documentTypes = [
    "License",
    "Insurance",
    "Roadworthiness",
    "Registration",
    "Emissions Test",
    "Safety Inspection"
  ];

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVehicle.name || !newVehicle.plate) {
      toast({
        title: "Error",
        description: "Please fill in all vehicle details",
        variant: "destructive"
      });
      return;
    }

    const vehicle = {
      id: vehicles.length + 1,
      name: newVehicle.name,
      plate: newVehicle.plate,
      documents: []
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ name: '', plate: '' });
    setShowAddForm(false);
    
    toast({
      title: "Success!",
      description: "Vehicle added successfully",
    });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDocument.vehicleId || !newDocument.type || !newDocument.expiry) {
      toast({
        title: "Error",
        description: "Please fill in all document details",
        variant: "destructive"
      });
      return;
    }

    const expiryDate = new Date(newDocument.expiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = 'safe';
    if (daysLeft <= 30) status = 'urgent';
    else if (daysLeft <= 60) status = 'warning';

    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === parseInt(newDocument.vehicleId)) {
        return {
          ...vehicle,
          documents: [...vehicle.documents, {
            type: newDocument.type,
            expiry: newDocument.expiry,
            daysLeft,
            status
          }]
        };
      }
      return vehicle;
    });

    setVehicles(updatedVehicles);
    setNewDocument({ vehicleId: '', type: '', expiry: '' });
    
    toast({
      title: "Success!",
      description: "Document added successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
              <p className="text-gray-600">Manage your vehicles and their documents</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Add Vehicle Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>Enter your vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVehicle} className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicleName">Vehicle Name</Label>
                  <Input
                    id="vehicleName"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                    placeholder="e.g., Honda Civic"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                    placeholder="e.g., ABC-123"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" className="flex-1">
                    Add Vehicle
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Document Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Document</CardTitle>
            <CardDescription>Add a document to an existing vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDocument} className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="vehicleSelect">Select Vehicle</Label>
                <Select value={newDocument.vehicleId} onValueChange={(value) => setNewDocument({...newDocument, vehicleId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.name} ({vehicle.plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={newDocument.type} onValueChange={(value) => setNewDocument({...newDocument, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newDocument.expiry}
                  onChange={(e) => setNewDocument({...newDocument, expiry: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Add Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Vehicles List */}
        <div className="grid lg:grid-cols-2 gap-8">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-600" />
                      {vehicle.name}
                    </CardTitle>
                    <CardDescription>{vehicle.plate}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Documents</h4>
                  {vehicle.documents.length === 0 ? (
                    <p className="text-gray-500 italic">No documents added yet</p>
                  ) : (
                    vehicle.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{doc.type}</div>
                            <div className="text-sm text-gray-600">Expires: {doc.expiry}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.daysLeft} days
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vehicles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles added yet</h3>
              <p className="text-gray-600 mb-4">Add your first vehicle to start tracking documents</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
