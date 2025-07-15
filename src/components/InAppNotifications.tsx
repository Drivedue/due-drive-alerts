import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Calendar, Car, AlertTriangle, CheckCircle } from "lucide-react";
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
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    const checkUserAndDocuments = async () => {
      if (!user) return;

      // Check if already shown today
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem(`drivedue_notification_shown_${user.id}`);
      if (lastShown === today) {
        setHasShownToday(true);
        return;
      }

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

      // Filter for high priority notifications (expiring within 7 days)
      const urgentDocuments = documents?.filter(doc => {
        const daysUntilExpiry = getDaysUntilExpiry(doc.expiry_date);
        return daysUntilExpiry <= 7;
      }) || [];

      if (urgentDocuments.length > 0) {
        // Sort by expiry date (soonest first)
        const sortedDocuments = urgentDocuments.sort((a, b) => 
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );

        setExpiringDocuments(sortedDocuments);
        setShowPopup(true);
      }
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

  const handleDismiss = () => {
    if (!user) return;
    
    // Mark as shown for today
    const today = new Date().toDateString();
    localStorage.setItem(`drivedue_notification_shown_${user.id}`, today);
    setHasShownToday(true);
    setShowPopup(false);
    
    toast({
      title: "Notifications dismissed",
      description: "You can view all expiring documents in the Documents section.",
    });
  };

  const handleMarkAllRead = () => {
    handleDismiss();
    toast({
      title: "All notifications marked as read",
      description: "Great! Stay on top of your document renewals.",
    });
  };

  // Don't show if not pro user, no documents, or already shown today
  if (!isProUser || expiringDocuments.length === 0 || hasShownToday) return null;

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <span>Urgent Document Alerts</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-4">
            The following documents are expiring soon and require your attention:
          </p>
          
          {expiringDocuments.map((document) => {
            const daysUntilExpiry = getDaysUntilExpiry(document.expiry_date);
            const urgency = getUrgencyLevel(daysUntilExpiry);
            const vehicleInfo = document.vehicles 
              ? `${document.vehicles.make} ${document.vehicles.model} (${document.vehicles.license_plate})`
              : 'your vehicle';

            return (
              <div 
                key={document.id} 
                className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{document.title}</h4>
                  <Badge variant={getUrgencyColor(urgency)} className="text-xs">
                    {daysUntilExpiry === 0 ? 'Expires Today!' :
                     daysUntilExpiry === 1 ? 'Expires Tomorrow!' :
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
                    <span>{new Date(document.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {urgency === 'critical' 
                    ? '🚨 Critical: Renew immediately to avoid penalties!'
                    : '⚠️ Important: Please renew soon to stay compliant.'}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button 
            onClick={handleMarkAllRead}
            className="w-full flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark All as Read
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="w-full"
          >
            Dismiss for Today
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InAppNotifications;