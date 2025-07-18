import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, TestTube, Send, Clock, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NotificationTesterProps {
  userPlan: string;
  isProUser: boolean;
}

interface TestResult {
  type: string;
  success: boolean;
  message: string;
  timestamp: string;
}

const NotificationTester = ({ userPlan, isProUser }: NotificationTesterProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);
  const [isCheckingDocuments, setIsCheckingDocuments] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [checkResults, setCheckResults] = useState<any>(null);

  const testNotifications = async () => {
    setIsTestingNotifications(true);
    setTestResults([]);

    try {
      // Create a mock notification request for testing
      const testData = {
        documentId: 'test-document-id',
        reminderType: '1_week',
        isTest: true
      };

      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: testData
      });

      if (error) {
        throw new Error(error.message);
      }

      const results: TestResult[] = data.notifications?.map((result: any) => ({
        type: result.type,
        success: result.success,
        message: result.success ? 'Test notification sent successfully' : result.error || 'Failed to send',
        timestamp: new Date().toLocaleTimeString()
      })) || [];

      setTestResults(results);

      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Test Complete",
        description: `${successCount} of ${results.length} notifications sent successfully`,
        variant: successCount > 0 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Test notification error:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test notifications",
        variant: "destructive"
      });
    } finally {
      setIsTestingNotifications(false);
    }
  };

  const manualDocumentCheck = async () => {
    setIsCheckingDocuments(true);
    setCheckResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-expiring-documents');

      if (error) {
        throw new Error(error.message);
      }

      setCheckResults(data);

      toast({
        title: "Document Check Complete",
        description: data.message || "Manual check completed",
      });

    } catch (error: any) {
      console.error('Manual check error:', error);
      toast({
        title: "Check Failed",
        description: error.message || "Failed to check documents",
        variant: "destructive"
      });
    } finally {
      setIsCheckingDocuments(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Notification Testing & Debugging
        </CardTitle>
        <CardDescription>
          Test your notification setup and manually check for expiring documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Test Notification Delivery</h4>
              <p className="text-sm text-muted-foreground">
                Send test notifications to verify your settings work correctly
              </p>
            </div>
            <Button 
              onClick={testNotifications} 
              disabled={isTestingNotifications}
              className="flex items-center gap-2"
            >
              {isTestingNotifications ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isTestingNotifications ? 'Testing...' : 'Test Notifications'}
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-sm">Test Results:</h5>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1">
                    {result.type.replace('document_expiry_', '').toUpperCase()}: {result.message}
                  </span>
                  <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Manual Document Check Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Manual Document Check</h4>
              <p className="text-sm text-muted-foreground">
                Manually trigger the system to check for expiring documents
              </p>
            </div>
            <Button 
              onClick={manualDocumentCheck} 
              disabled={isCheckingDocuments}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isCheckingDocuments ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Bug className="h-4 w-4" />
              )}
              {isCheckingDocuments ? 'Checking...' : 'Check Documents'}
            </Button>
          </div>

          {/* Check Results */}
          {checkResults && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-sm">Check Results:</h5>
              <div className="text-sm">
                <p className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={checkResults.success ? "default" : "destructive"}>
                    {checkResults.success ? "Success" : "Failed"}
                  </Badge>
                </p>
                <p className="mt-2">{checkResults.message}</p>
                {checkResults.results && checkResults.results.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="font-medium">Notifications sent:</p>
                    {checkResults.results.map((result: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 pl-4">
                        {result.success ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>
                          Document ID: {result.documentId} - {result.reminderType}
                          {!result.success && ` (${result.error})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Notification Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Settings:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Plan:</span>
              <Badge variant={isProUser ? "default" : "secondary"}>
                {isProUser ? "Pro" : "Free"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Available:</span>
              <Badge variant={isProUser ? "default" : "secondary"}>
                {isProUser ? "Yes" : "Pro Only"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <p className="font-medium mb-1">Debug Info:</p>
          <p>User ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
          <p>Plan: {userPlan}</p>
          <p>Pro Status: {isProUser ? "Active" : "Inactive"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTester;