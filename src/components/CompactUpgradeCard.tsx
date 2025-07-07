
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import UpgradePrompt from "@/components/settings/UpgradePrompt";

interface CompactUpgradeCardProps {
  onUpgradeSuccess?: () => void;
}

const CompactUpgradeCard = ({ onUpgradeSuccess }: CompactUpgradeCardProps) => {
  const { userPlan } = usePlanLimits();

  if (userPlan.plan_type === 'pro') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-3 w-3 text-blue-600" />
              <h3 className="font-semibold text-xs text-gray-800">Upgrade to Pro</h3>
              <span className="text-sm font-bold text-blue-600">₦4,999/year</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Check className="h-2 w-2 text-green-600" />
                <span className="text-xs">Unlimited vehicles</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-2 w-2 text-green-600" />
                <span className="text-xs">Unlimited documents</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-2 w-2 text-green-600" />
                <span className="text-xs">SMS notifications</span>
              </div>
            </div>
          </div>
          <div className="ml-3">
            <UpgradePrompt userPlan="Free" compact={true} onUpgradeSuccess={onUpgradeSuccess} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactUpgradeCard;
