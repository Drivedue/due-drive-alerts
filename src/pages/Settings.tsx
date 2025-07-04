
import MobileLayout from "@/components/MobileLayout";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ReminderSchedule from "@/components/settings/ReminderSchedule";
import AccountSettings from "@/components/settings/AccountSettings";
import InformationSection from "@/components/settings/InformationSection";
import UpgradePrompt from "@/components/settings/UpgradePrompt";

const Settings = () => {
  const user = {
    plan: "Free",
    email: "john.doe@example.com"
  };

  return (
    <MobileLayout title="Settings">
      <NotificationSettings userPlan={user.plan} />
      <ReminderSchedule />
      <AccountSettings userPlan={user.plan} />
      <InformationSection />
      <UpgradePrompt userPlan={user.plan} />
    </MobileLayout>
  );
};

export default Settings;
