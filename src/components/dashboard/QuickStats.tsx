
import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, AlertTriangle } from "lucide-react";

interface QuickStatsProps {
  vehicleCount: number;
  documentCount: number;
  expiredCount: number;
}

const QuickStats = ({ vehicleCount, documentCount, expiredCount }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#0A84FF]/10 p-2 rounded-full">
              <Car className="h-4 w-4 text-[#0A84FF]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A84FF]">{vehicleCount}</div>
              <p className="text-xs text-gray-600">Vehicles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{documentCount}</div>
              <p className="text-xs text-gray-600">Documents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{expiredCount}</div>
              <p className="text-xs text-gray-600">Expired</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
