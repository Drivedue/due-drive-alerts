
import { Card, CardContent } from "@/components/ui/card";

interface GarageStatsProps {
  vehicleCount: number;
  documentCount: number;
}

const GarageStats = ({ vehicleCount, documentCount }: GarageStatsProps) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-[#0A84FF]">{vehicleCount}</div>
            <div className="text-xs text-gray-600">Vehicles</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{documentCount}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GarageStats;
