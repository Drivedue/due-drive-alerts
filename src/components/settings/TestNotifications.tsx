import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Send } from "lucide-react";

const TestNotifications = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const testNotificationSystem = async () => {
    setTesting(true);
    try {
      // Trigger the document expiry check function
      const { data, error } = await supabase.functions.invoke('check-expiring-documents');
      
      if (error) throw error;

      toast({
        title: "Notification Test Complete",
        description: data.message || "Test completed successfully",
      });
    } catch (error: any) {
      console.error('Test notification error:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test notification system",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System
        </CardTitle>
        <CardDescription>
          Test your notification system and view reminder settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
          <h4 className="font-medium mb-2">Automatic Reminders</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Your documents are automatically checked for expiry dates and reminders are sent:
          </p>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 4 weeks before expiration</li>
            <li>• 3 weeks before expiration</li>
            <li>• 2 weeks before expiration</li>
            <li>• 1 week before expiration</li>
            <li>• 1 day before expiration</li>
          </ul>
        </div>

        <Button 
          onClick={testNotificationSystem} 
          disabled={testing}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {testing ? 'Testing...' : 'Test Notification System'}
        </Button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          This will check all your documents and send any due reminders based on your notification preferences.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestNotifications;