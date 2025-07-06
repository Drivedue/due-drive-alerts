
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertTriangle } from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import UpgradePrompt from "@/components/settings/UpgradePrompt";

const PlanLimitsBanner = () => {
  const { userPlan, vehicleCount, documentCount, loading } = usePlanLimits();

  if (loading) return null;

  const vehicleLimit = userPlan.limits.vehicles;
  const documentLimit = userPlan.limits.documents;
  const isNearVehicleLimit = vehicleLimit !== Infinity && vehicleCount >= vehicleLimit;
  const isNearDocumentLimit = documentLimit !== Infinity && documentCount >= documentLimit;

  if (userPlan.plan_type === 'pro') {
    return (
      <div className="mb-4">
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Pro Plan - Unlimited Access
        </Badge>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Free Plan</Badge>
        <span className="text-xs text-gray-600">
          Vehicles: {vehicleCount}/{vehicleLimit} • Documents: {documentCount}/{documentLimit}
        </span>
      </div>
      
      {(isNearVehicleLimit || isNearDocumentLimit) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm">
            {isNearVehicleLimit && "You've reached your vehicle limit. "}
            {isNearDocumentLimit && "You've reached your document limit. "}
            <UpgradePrompt userPlan="Free" />
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PlanLimitsBanner;
