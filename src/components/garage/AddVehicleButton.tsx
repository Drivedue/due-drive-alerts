
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddVehicleButtonProps {
  onAddVehicle: () => void;
}

const AddVehicleButton = ({ onAddVehicle }: AddVehicleButtonProps) => {
  return (
    <Button
      className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
      onClick={onAddVehicle}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default AddVehicleButton;
