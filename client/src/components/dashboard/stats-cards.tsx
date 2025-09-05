import { Card } from "@/components/ui/card";
import { CreditCard, Users, CheckSquare, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Pending Payments",
      value: `₹${parseInt((stats as any)?.pendingPayments || '0').toLocaleString()}`,
      icon: CreditCard,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12% from last week",
      changeColor: "text-error",
      href: "/credit-payments"
    },
    {
      title: "Active Clients",
      value: (stats as any)?.activeClients || 0,
      icon: Users,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      change: "+5% from last week",
      changeColor: "text-success",
      href: "/client-management"
    },
    {
      title: "Open Tasks",
      value: (stats as any)?.openTasks || 0,
      icon: CheckSquare,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
      change: "3 overdue",
      changeColor: "text-warning",
      href: "/task-management"
    },
    {
      title: "In Transit",
      value: (stats as any)?.inTransit || 0,
      icon: Truck,
      iconColor: "text-info",
      bgColor: "bg-info/10",
      change: "12 arriving today",
      changeColor: "text-info",
      href: "/client-tracking"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link key={index} href={card.href}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary" data-testid={`card-${card.title.toLowerCase().replace(' ', '-')}`}>
              <div className="flex items-center">
                <div className={`p-2 ${card.bgColor} rounded-lg`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors">{card.value}</p>
                  <p className={`text-xs ${card.changeColor} mt-1`}>{card.change}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
