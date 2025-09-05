import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  User, 
  CreditCard, 
  CheckSquare, 
  UserPlus, 
  Package, 
  MessageSquare,
  Activity
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'user_action' | 'payment' | 'task' | 'system' | 'order' | 'message';
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  details?: string;
}

export function ActivityFeed() {
  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'payment',
      user: 'John Smith',
      action: 'received payment',
      target: '₹45,000 from Acme Corp',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      details: 'Invoice #INV-2024-001'
    },
    {
      id: '2',
      type: 'task',
      user: 'Sarah Wilson',
      action: 'completed task',
      target: 'Client follow-up call',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      details: 'Client: TechStart Solutions'
    },
    {
      id: '3',
      type: 'user_action',
      user: 'Mike Johnson',
      action: 'created new client',
      target: 'Global Industries Ltd',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      details: 'Category: BETA'
    },
    {
      id: '4',
      type: 'order',
      user: 'Admin',
      action: 'approved order',
      target: 'Order #ORD-2024-025',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      details: 'Value: ₹125,000'
    },
    {
      id: '5',
      type: 'system',
      user: 'System',
      action: 'sent reminder',
      target: '3 overdue tasks',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'Auto-generated notification'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return CreditCard;
      case 'task': return CheckSquare;
      case 'user_action': return UserPlus;
      case 'order': return Package;
      case 'message': return MessageSquare;
      case 'system': return Activity;
      default: return User;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'payment': return 'text-green-600 bg-green-100';
      case 'task': return 'text-blue-600 bg-blue-100';
      case 'user_action': return 'text-purple-600 bg-purple-100';
      case 'order': return 'text-orange-600 bg-orange-100';
      case 'message': return 'text-cyan-600 bg-cyan-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Badge variant="outline" className="px-2 py-1">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colors = getColors(activity.type);
          
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex-shrink-0 flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-2 rounded-full ${colors}`}>
                  <Icon className="h-3 w-3" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>
                      {' '}
                      <span className="text-gray-600">{activity.action}</span>
                      {activity.target && (
                        <>
                          {' '}
                          <span className="font-medium text-gray-900">{activity.target}</span>
                        </>
                      )}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-3 border-t">
          <Link href="/user-management">
            <Button variant="ghost" className="w-full text-sm" data-testid="button-view-all-activity">
              View All Activity
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}