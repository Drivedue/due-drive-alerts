
import PaystackUpgrade from "@/components/PaystackUpgrade";

interface UpgradePromptProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
  compact?: boolean;
}

const UpgradePrompt = ({ userPlan, onUpgradeSuccess, compact = false }: UpgradePromptProps) => {
  return <PaystackUpgrade userPlan={userPlan} onUpgradeSuccess={onUpgradeSuccess} compact={compact} />;
};

export default UpgradePrompt;
