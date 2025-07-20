
import { Plus } from "lucide-react";
import FloatingActionButton from "@/components/ui/floating-action-button";

interface AddVehicleButtonProps {
  onAddVehicle: () => void;
}

const AddVehicleButton = ({ onAddVehicle }: AddVehicleButtonProps) => {
  return (
    <FloatingActionButton
      onClick={onAddVehicle}
      icon={<Plus className="h-6 w-6" />}
      label="Add Vehicle"
      variant="primary"
      size="large"
    />
  );
};

export default AddVehicleButton;
