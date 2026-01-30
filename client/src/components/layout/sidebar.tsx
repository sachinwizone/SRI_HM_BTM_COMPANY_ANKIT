import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions, ModuleName } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { 
  Home, CreditCard, Bell, Users, MapPin, BarChart3, 
  CheckSquare, ShoppingCart, File, Receipt, 
  FileText, TrendingUp, DollarSign, Database, Settings, LucideIcon, Package, Clock, LogOut, Target, Plane
} from "lucide-react";
import logoImage from "@assets/Jpeg-01_1756898940585.jpg";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  module?: ModuleName;
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
  module?: ModuleName;
};

type NavigationEntry = NavigationItem | NavigationSection;

const navigation: NavigationEntry[] = [
  { name: "Dashboard", href: "/", icon: Home, module: "DASHBOARD" },
  {
    section: "PAYMENTS",
    items: [
      { name: "Credit Payments", href: "/credit-payments", icon: CreditCard, badge: "5", module: "CREDIT_PAYMENTS" },
      { name: "Payment Alerts", href: "/payment-alerts", icon: Bell, badge: "12", module: "CREDIT_PAYMENTS" },
    ],
  },
  {
    section: "CLIENTS",
    items: [
      { name: "Client Management", href: "/client-management", icon: Users, module: "CLIENT_MANAGEMENT" },
      { name: "Client Tracking", href: "/client-tracking", icon: MapPin, module: "CLIENT_TRACKING" },
      { name: "Sales Rates", href: "/sales-rates", icon: BarChart3, module: "SALES_RATES" },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { name: "Task Management", href: "/task-management", icon: CheckSquare, module: "TASK_MANAGEMENT" },
      { name: "Follow-up Hub", href: "/follow-up-hub", icon: Target, module: "FOLLOW_UP_HUB" },
      { name: "Lead Follow-ups", href: "/lead-follow-up-hub", icon: Clock, module: "LEAD_FOLLOW_UP" },
      { name: "Order Workflow", href: "/order-workflow", icon: ShoppingCart, module: "ORDER_WORKFLOW" },
      { name: "Credit Agreements", href: "/credit-agreements", icon: File, module: "CREDIT_AGREEMENTS" },
      { name: "E-Way Bills", href: "/eway-bills", icon: Receipt, module: "EWAY_BILLS" },
    ],
  },
  {
    section: "SALES",
    items: [
      { name: "Sales", href: "/sales", icon: Package, module: "SALES" },
      { name: "Sales Operations", href: "/sales-operations", icon: Target, module: "SALES_OPERATIONS" },
      { name: "Tour Advance", href: "/tour-advance", icon: Plane, module: "TOUR_ADVANCE" },
      { name: "TA Reports", href: "/ta-reports", icon: FileText, module: "TA_REPORTS" },
      { name: "Purchase Orders", href: "/purchase-orders", icon: FileText, module: "PURCHASE_ORDERS" },
      { name: "Team Performance", href: "/team-performance", icon: TrendingUp, module: "TEAM_PERFORMANCE" },
    ],
  },
  {
    section: "INVOICE MANAGEMENT",
    items: [
      { name: "Invoice Management", href: "/invoice-management", icon: Receipt, module: "INVOICE_MANAGEMENT" },
      { name: "Pending Orders", href: "/pending-orders", icon: Package, module: "INVOICE_MANAGEMENT" },
    ],
  },
  {
    section: "REPORTS",
    items: [
      { name: "Reports & Analytics", href: "/reports", icon: BarChart3, module: "REPORTS" },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { name: "Master Data", href: "/master-data", icon: Database, module: "MASTER_DATA" },
      { name: "User Management", href: "/user-management", icon: Settings, module: "USER_MANAGEMENT" },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasViewPermission } = usePermissions();

  // Check if user is admin - admins see everything
  const isAdmin = user?.role === 'ADMIN';

  // Filter navigation based on permissions
  const filteredNavigation = navigation.map(item => {
    if ('href' in item) {
      // Single item - admin sees all, others need permission
      return isAdmin || !item.module || hasViewPermission(item.module) ? item : null;
    } else {
      // Section - filter items based on role
      const visibleItems = item.items.filter(subItem => 
        isAdmin || !subItem.module || hasViewPermission(subItem.module)
      );
      return visibleItems.length > 0 ? { ...item, items: visibleItems } : null;
    }
  }).filter(Boolean) as NavigationEntry[];

  console.log('User role:', user?.role);
  console.log('Is Admin:', isAdmin);
  console.log('Filtered navigation:', filteredNavigation);

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="w-full -mx-6 px-1 py-3 bg-white flex justify-center items-center min-h-[100px]">
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="Bitumen Company Logo" 
              className="w-[90%] h-auto object-contain max-h-24 mx-auto"
              onError={(e) => {
                console.log('Image failed to load:', logoImage);
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-xl font-bold text-gray-900 mt-2">
              Bitumen Company
            </div>
            <p className="text-sm text-gray-500">Business Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="space-y-1">

          
          {filteredNavigation.map((item, index) => {
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
