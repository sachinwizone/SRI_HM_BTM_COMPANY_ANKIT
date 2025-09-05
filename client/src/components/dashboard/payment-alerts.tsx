import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function PaymentAlerts() {
  const { data: overduePayments } = useQuery({
    queryKey: ['/api/payments', { overdue: 'true' }],
  });

  const { data: dueSoonPayments } = useQuery({
    queryKey: ['/api/payments', { dueSoon: '7' }],
  });

  const allAlerts = [
    ...(overduePayments || []).map(payment => ({
      ...payment,
      type: 'overdue',
      icon: AlertTriangle,
      bgColor: 'bg-error/5',
      borderColor: 'border-error/20',
      iconColor: 'text-error',
      amountColor: 'text-error'
    })),
    ...(dueSoonPayments || []).map(payment => ({
      ...payment,
      type: 'due_soon',
      icon: Clock,
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/20',
      iconColor: 'text-warning',
      amountColor: 'text-warning'
    }))
  ].slice(0, 3);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Payment Alerts</h3>
        <Link href="/payment-alerts">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all-payments">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No payment alerts at this time</p>
            </div>
          ) : (
            allAlerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${alert.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={alert.iconColor} size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Client Payment</p>
                      <p className="text-sm text-gray-600">
                        {alert.type === 'overdue' 
                          ? `Payment overdue`
                          : `Payment due soon`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${alert.amountColor}`}>
                      ₹{parseInt(alert.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(alert.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
