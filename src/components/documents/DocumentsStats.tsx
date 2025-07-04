
import { Card, CardContent } from "@/components/ui/card";

interface DocumentsStatsProps {
  total: number;
  expired: number;
  expiring: number;
  valid: number;
}

const DocumentsStats = ({ total, expired, expiring, valid }: DocumentsStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      <Card className="text-center">
        <CardContent className="p-3">
          <div className="text-lg font-bold text-blue-600">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-3">
          <div className="text-lg font-bold text-red-600">{expired}</div>
          <div className="text-xs text-gray-600">Expired</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-3">
          <div className="text-lg font-bold text-orange-600">{expiring}</div>
          <div className="text-xs text-gray-600">Expiring</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-3">
          <div className="text-lg font-bold text-green-600">{valid}</div>
          <div className="text-xs text-gray-600">Valid</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsStats;
