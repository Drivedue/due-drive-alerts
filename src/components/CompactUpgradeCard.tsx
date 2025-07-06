
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import UpgradePrompt from "@/components/settings/UpgradePrompt";

const CompactUpgradeCard = () => {
  const { userPlan } = usePlanLimits();

  if (userPlan.plan_type === 'pro') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-800">Upgrade to Pro</h3>
              <span className="text-lg font-bold text-blue-600">₦4,999/year</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Unlimited vehicles</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Unlimited documents</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>SMS notifications</span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <UpgradePrompt userPlan="Free" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactUpgradeCard;
