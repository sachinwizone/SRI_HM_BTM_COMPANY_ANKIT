import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function SalesPerformance() {
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const salesTeam = ((users as any[]) || []).filter((user: any) => 
    user.role === 'SALES_EXECUTIVE' || user.role === 'SALES_MANAGER'
  ).slice(0, 3);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getColorByIndex = (index: number) => {
    const colors = [
      { bg: 'bg-primary', text: 'text-white' },
      { bg: 'bg-secondary', text: 'text-white' },
      { bg: 'bg-warning', text: 'text-white' }
    ];
    return colors[index % colors.length];
  };

  // Mock performance data
  const performanceData = [
    { activityScore: 92, conversionRate: 24, target: '4.2L', total: '5L' },
    { activityScore: 88, conversionRate: 31, target: '3.8L', total: '4L' },
    { activityScore: 76, conversionRate: 18, target: '2.1L', total: '3L' }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Sales Team Performance</h3>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
          </select>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
            View Detailed Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {salesTeam.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No sales team members found
            </div>
          ) : (
            salesTeam.map((member: any, index: number) => {
              const colors = getColorByIndex(index);
              const perf = performanceData[index] || performanceData[0];
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
                      <span className={`font-medium ${colors.text}`}>
                        {getInitials(member.firstName, member.lastName)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.role === 'SALES_MANAGER' ? 'Sales Manager' : 'Sales Executive'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Activity Score</span>
                      <span className="font-semibold text-gray-900">{perf.activityScore}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${perf.activityScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold text-gray-900">{perf.conversionRate}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${perf.conversionRate}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Monthly Target</span>
                      <span className="font-semibold text-success">
                        ₹{perf.target} / ₹{perf.total}
                      </span>
                    </div>
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