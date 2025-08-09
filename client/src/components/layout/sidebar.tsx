import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, CreditCard, Bell, Users, MapPin, BarChart3, 
  CheckSquare, ShoppingCart, File, Receipt, 
  FileText, TrendingUp, DollarSign
} from "lucide-react";

const navigation = [
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
      { name: "Order Workflow", href: "/order-workflow", icon: ShoppingCart },
      { name: "Credit Agreements", href: "/credit-agreements", icon: File },
      { name: "E-Way Bills", href: "/eway-bills", icon: Receipt },
    ],
  },
  {
    section: "SALES",
    items: [
      { name: "Purchase Orders", href: "/purchase-orders", icon: FileText },
      { name: "Team Performance", href: "/team-performance", icon: TrendingUp },
      { name: "Pricing Plans", href: "/pricing", icon: DollarSign },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="text-primary mr-2" size={24} />
          BizFlow Pro
        </h1>
        <p className="text-sm text-gray-500 mt-1">Business Management Suite</p>
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
                  <a className={cn(
                    "px-3 py-2 rounded-lg flex items-center space-x-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </a>
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
                        <a className={cn(
                          "px-3 py-2 rounded-lg flex items-center space-x-3 text-sm font-medium transition-colors",
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
                        </a>
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500">Sales Manager</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
