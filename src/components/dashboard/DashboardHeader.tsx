
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  userPlan: string;
  isUpgrading: boolean;
  onUpgrade: () => void;
}

const DashboardHeader = ({ userName, userPlan, isUpgrading, onUpgrade }: DashboardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Welcome back, {userName}!</h2>
          <p className="text-gray-600 text-sm">Stay on top of your vehicle documents</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={userPlan === "Pro" ? "default" : "secondary"} className="mt-1">
          {userPlan} Plan
        </Badge>
        {userPlan === "Free" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            disabled={isUpgrading}
            className="flex items-center gap-2 text-[#0A84FF] border-[#0A84FF] hover:bg-[#0A84FF]/10"
          >
            <Crown className="h-4 w-4" />
            {isUpgrading ? "Processing..." : "Upgrade to Pro"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
