import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Calendar, Car, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpiringDocument {
  id: string;
  title: string;
  document_type: string;
  expiry_date: string;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  } | null;
}

const InAppNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expiringDocuments, setExpiringDocuments] = useState<ExpiringDocument[]>([]);
  const [isProUser, setIsProUser] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const checkUserAndDocuments = async () => {
      if (!user) return;

      // Check if user is Pro
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('plan_code', 'pro')
        .single();

      const isPro = !!subscription;
      setIsProUser(isPro);

      if (!isPro) return; // Only show notifications for Pro users

      // Get documents expiring in the next 30 days
      const now = new Date();
      const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          document_type,
          expiry_date,
          vehicles(make, model, license_plate)
        `)
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', now.toISOString().split('T')[0])
        .lte('expiry_date', futureDate.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching expiring documents:', error);
        return;
      }

      // Sort by expiry date (soonest first)
      const sortedDocuments = documents?.sort((a, b) => 
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      ) || [];

      setExpiringDocuments(sortedDocuments);
    };

    checkUserAndDocuments();
  }, [user]);

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (days: number) => {
    if (days <= 1) return 'critical';
    if (days <= 7) return 'high';
    if (days <= 14) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const dismissNotification = (documentId: string) => {
    setDismissed(prev => [...prev, documentId]);
    toast({
      title: "Notification dismissed",
      description: "You can view all expiring documents in the Documents section.",
    });
  };

  const visibleDocuments = expiringDocuments.filter(doc => !dismissed.includes(doc.id));

  if (!isProUser || visibleDocuments.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleDocuments.map((document) => {
        const daysUntilExpiry = getDaysUntilExpiry(document.expiry_date);
        const urgency = getUrgencyLevel(daysUntilExpiry);
        const vehicleInfo = document.vehicles 
          ? `${document.vehicles.make} ${document.vehicles.model} (${document.vehicles.license_plate})`
          : 'your vehicle';

        return (
          <Card key={document.id} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {urgency === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Bell className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">
                        {document.title}
                      </h4>
                      <Badge variant={getUrgencyColor(urgency)} className="text-xs">
                        {daysUntilExpiry === 0 ? 'Expires Today' :
                         daysUntilExpiry === 1 ? 'Expires Tomorrow' :
                         `${daysUntilExpiry} days left`}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        <span>{vehicleInfo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {new Date(document.expiry_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {urgency === 'critical' 
                        ? 'Urgent: This document expires very soon! Renew immediately to avoid penalties.'
                        : urgency === 'high'
                        ? 'Important: Please renew this document soon to stay compliant.'
                        : 'Reminder: This document will expire soon. Consider renewing early.'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(document.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InAppNotifications;