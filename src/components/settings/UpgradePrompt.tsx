
import PaystackUpgrade from "@/components/PaystackUpgrade";

interface UpgradePromptProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
}

const UpgradePrompt = ({ userPlan, onUpgradeSuccess }: UpgradePromptProps) => {
  return <PaystackUpgrade userPlan={userPlan} onUpgradeSuccess={onUpgradeSuccess} />;
};

export default UpgradePrompt;
