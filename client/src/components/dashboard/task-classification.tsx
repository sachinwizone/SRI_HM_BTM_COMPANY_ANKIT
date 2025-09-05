import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function TaskClassification() {
  const { data: oneTimeTasks } = useQuery({
    queryKey: ['/api/tasks', { type: 'ONE_TIME' }],
  });

  const { data: recurringTasks } = useQuery({
    queryKey: ['/api/tasks', { type: 'RECURRING' }],
  });

  const oneTimeCount = oneTimeTasks?.filter(task => !task.isCompleted).length || 0;
  const recurringCount = recurringTasks?.filter(task => !task.isCompleted).length || 0;
  const totalTasks = oneTimeCount + recurringCount;
  const completionRate = totalTasks > 0 ? Math.round(((totalTasks - oneTimeCount - recurringCount) / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Task Classification</h3>
        <Link href="/task-management">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-manage-tasks">
            Manage Tasks
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarCheck className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">One-time Tasks</p>
                <p className="text-sm text-gray-600">Project specific activities</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{oneTimeCount}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <RotateCcw className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Recurring Tasks</p>
                <p className="text-sm text-gray-600">Fixed/repeated activities</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{recurringCount}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Task Completion Rate</span>
            <span className="font-semibold text-gray-900">{completionRate}%</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
