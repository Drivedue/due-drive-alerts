import { supabase } from "@/integrations/supabase/client";

export const syncOldUsers = async () => {
  try {
    console.log('Starting manual sync of all users...');
    
    const { data, error } = await supabase.functions.invoke('manual-sync-all-users');
    
    if (error) {
      console.error('Error syncing users:', error);
      throw error;
    }
    
    console.log('Sync completed successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to sync users:', error);
    throw error;
  }
};