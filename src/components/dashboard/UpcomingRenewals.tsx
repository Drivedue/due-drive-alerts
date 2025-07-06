
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Renewal {
  id: string;
  vehiclePlate: string;
  title: string;
  status: string;
  daysLeft: number;
}

interface UpcomingRenewalsProps {
  renewals: Renewal[];
  onDocumentEdit: (renewal: Renewal) => void;
}

const UpcomingRenewals = ({ renewals, onDocumentEdit }: UpcomingRenewalsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (renewals.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Renewals</h3>
      
      <div className="space-y-3">
        {renewals.map((renewal) => (
          <Card key={renewal.id} className={`border-l-4 ${renewal.status === 'expired' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{renewal.vehiclePlate}</h4>
                <Badge className={getStatusColor(renewal.status)}>
                  {renewal.status === 'expired' 
                    ? `Expired ${Math.abs(renewal.daysLeft)} days ago`
                    : `${renewal.daysLeft} days left`
                  }
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-3">{renewal.title} renewal {renewal.status === 'expired' ? 'overdue' : 'due'}</p>
              {renewal.status === 'expired' && (
                <Button 
                  className="w-full text-xs" 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDocumentEdit(renewal)}
                >
                  If renewed, update with new expiry date!
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpcomingRenewals;
