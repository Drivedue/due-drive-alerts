
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccountSettingsProps {
  userPlan: string;
}

const AccountSettings = ({ userPlan }: AccountSettingsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-between h-auto p-3"
          onClick={() => navigate('/upgrade')}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-gray-600" />
            <span>Subscription</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{userPlan}</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
