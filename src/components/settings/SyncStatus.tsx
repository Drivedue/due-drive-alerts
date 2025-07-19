import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, Clock, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  error_message?: string;
  created_at: string;
  retry_count: number;
}

const SyncStatus = () => {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    setSyncing(true);
    try {
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (profileError) throw profileError;

      // Call the sync-user-profile edge function directly
      const { data, error } = await supabase.functions.invoke('sync-user-profile', {
        body: {
          user_id: profile.id,
          email: profile.id, // This will be replaced with actual email from auth
          phone: profile.phone,
          full_name: profile.full_name,
          preferred_channels: [
            ...(profile.email_notifications ? ['email'] : []),
            ...(profile.sms_notifications ? ['sms'] : []),
            ...(profile.push_notifications ? ['push'] : [])
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Successful",
        description: "Your profile has been synced with the notification service.",
      });

      // Refresh sync logs
      await fetchSyncLogs();
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-700 border-green-300">Success</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-700 border-red-300">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <CardTitle>Notification Sync Status</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSyncLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={manualSync}
              disabled={syncing}
            >
              {syncing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Manual Sync
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : syncLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sync history available</p>
        ) : (
          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {log.sync_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.retry_count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Retry {log.retry_count}
                    </Badge>
                  )}
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncStatus;