import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function ClientCategories() {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const categories = [
    {
      name: "Alpha",
      count: stats?.clientCategories?.ALFA || 0,
      description: "Premium clients",
      color: "bg-green-500"
    },
    {
      name: "Beta", 
      count: stats?.clientCategories?.BETA || 0,
      description: "Standard clients",
      color: "bg-blue-500"
    },
    {
      name: "Gamma",
      count: stats?.clientCategories?.GAMMA || 0,
      description: "Regular clients", 
      color: "bg-yellow-500"
    },
    {
      name: "Delta",
      count: stats?.clientCategories?.DELTA || 0,
      description: "New clients",
      color: "bg-red-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Client Categories</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{category.count}</p>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button variant="link" className="w-full text-primary hover:text-primary/80 text-sm font-medium">
            Manage Categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
