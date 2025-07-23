import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { syncOldUsers } from '@/scripts/syncOldUsers';

export const SyncUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncOldUsers();
      toast({
        title: "Sync Completed",
        description: `Successfully synced ${result.results?.length || 0} users`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? "Syncing..." : "Sync All Users"}
    </Button>
  );
};