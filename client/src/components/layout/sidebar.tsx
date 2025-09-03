import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Home, CreditCard, Bell, Users, MapPin, BarChart3, 
  CheckSquare, ShoppingCart, File, Receipt, 
  FileText, TrendingUp, DollarSign, Database, Settings, LucideIcon, Package, Clock, LogOut, Target
} from "lucide-react";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
};

type NavigationEntry = NavigationItem | NavigationSection;

const navigation: NavigationEntry[] = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    section: "PAYMENTS",
    items: [
      { name: "Credit Payments", href: "/credit-payments", icon: CreditCard, badge: "5" },
      { name: "Payment Alerts", href: "/credit-payments", icon: Bell, badge: "12" },
    ],
  },
  {
    section: "CLIENTS",
    items: [
      { name: "Client Management", href: "/client-management", icon: Users },
      { name: "Client Tracking", href: "/client-tracking", icon: MapPin },
      { name: "Sales Rates", href: "/sales-rates", icon: BarChart3 },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { name: "Task Management", href: "/task-management", icon: CheckSquare },
      { name: "Follow-up Hub", href: "/follow-up-hub", icon: Target },
      { name: "Lead Follow-ups", href: "/lead-follow-up-hub", icon: Clock },
      { name: "Order Workflow", href: "/order-workflow", icon: ShoppingCart },
      { name: "Credit Agreements", href: "/credit-agreements", icon: File },
      { name: "E-Way Bills", href: "/eway-bills", icon: Receipt },
    ],
  },
  {
    section: "SALES",
    items: [
      { name: "Sales", href: "/sales", icon: Package },
      { name: "Sales Operations", href: "/sales-operations", icon: Target },
      { name: "Purchase Orders", href: "/purchase-orders", icon: FileText },
      { name: "Team Performance", href: "/team-performance", icon: TrendingUp },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      { name: "Master Data", href: "/master-data", icon: Database },
      { name: "User Management", href: "/user-management", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <img 
            src="@assets/image_1756898354167.png" 
            alt="Bitumen Company Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Quality & Service is Our Specialty</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            if ('href' in item) {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={index} href={item.href}>
                  <div className={cn(
                    "px-3 py-2 rounded-lg flex items-center space-x-3 text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            } else {
              return (
                <div key={index} className="pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {item.section}
                  </p>
                  {item.items.map((subItem, subIndex) => {
                    const Icon = subItem.icon;
                    const isActive = location === subItem.href;
                    
                    return (
                      <Link key={subIndex} href={subItem.href}>
                        <div className={cn(
                          "px-3 py-2 rounded-lg flex items-center space-x-3 text-sm font-medium transition-colors cursor-pointer",
                          isActive 
                            ? "bg-primary text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}>
                          <Icon size={20} />
                          <span>{subItem.name}</span>
                          {subItem.badge && (
                            <span className="ml-auto bg-warning text-white text-xs px-2 py-1 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            }
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-gray-700 hover:text-red-600 hover:border-red-300"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
