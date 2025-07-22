import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const UserDataSync = () => {
  const { user } = useAuth();
  const [issyncing, setIssyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);

  const handleSync = async () => {
    if (!user) return;
    
    setIssyncing(true);
    setLastSyncStatus(null);

    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Call the sync-user-profile edge function
      const { data, error } = await supabase.functions.invoke('sync-user-profile', {
        body: {
          user_id: user.id,
          email: user.email,
          phone: profile.phone,
          full_name: profile.full_name,
          preferred_channels: [
            ...(profile.email_notifications ? ['email'] : []),
            ...(profile.sms_notifications ? ['sms'] : []),
            ...(profile.push_notifications ? ['push'] : []),
          ]
        }
      });

      if (error) {
        throw error;
      }

      setLastSyncStatus('success');
      toast.success('User data synchronized successfully with NotificationAPI');
    } catch (error: any) {
      console.error('Sync failed:', error);
      setLastSyncStatus('error');
      toast.error('Failed to sync user data: ' + (error.message || 'Unknown error'));
    } finally {
      setIssyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (issyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (lastSyncStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (lastSyncStatus === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <RefreshCw className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (issyncing) return "Syncing...";
    if (lastSyncStatus === 'success') return "Last sync successful";
    if (lastSyncStatus === 'error') return "Last sync failed";
    return "Ready to sync";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Data Synchronization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sync your profile data and notification preferences with NotificationAPI to ensure you receive timely alerts.
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          </div>
          
          <Button 
            onClick={handleSync} 
            disabled={issyncing}
            variant="outline"
            size="sm"
          >
            {issyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDataSync;