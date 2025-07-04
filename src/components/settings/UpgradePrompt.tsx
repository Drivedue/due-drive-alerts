
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradePromptProps {
  userPlan: string;
}

const UpgradePrompt = ({ userPlan }: UpgradePromptProps) => {
  if (userPlan !== "Free") return null;

  return (
    <Card className="bg-gradient-to-r from-[#0A84FF] to-purple-600 text-white">
      <CardContent className="p-4 text-center">
        <h3 className="font-bold mb-2">Upgrade to Pro</h3>
        <p className="text-blue-100 mb-4 text-sm">
          Get SMS notifications and manage up to 5 vehicles
        </p>
        <Button variant="secondary" className="w-full">
          Upgrade Now - $9.99/month
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
