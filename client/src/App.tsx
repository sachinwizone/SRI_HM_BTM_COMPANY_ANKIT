import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CreditPayments from "@/pages/credit-payments";
import Clients from "@/pages/clients-new";
import ClientTracking from "@/pages/client-tracking";
import TaskManagement from "@/pages/task-management";
import OrderWorkflow from "@/pages/order-workflow";
import CreditAgreements from "@/pages/credit-agreements";
import EwayBills from "@/pages/eway-bills";
import PurchaseOrders from "@/pages/purchase-orders";
import TeamPerformance from "@/pages/team-performance";
import SalesRates from "@/pages/sales-rates";
import Pricing from "@/pages/pricing";
import Sales from "@/pages/sales";

import UserManagement from "@/pages/user-management";
import AuthPage from "@/pages/auth";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-medium text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/credit-payments" component={CreditPayments} />
            <Route path="/client-management" component={Clients} />
            <Route path="/client-tracking" component={ClientTracking} />
            <Route path="/task-management" component={TaskManagement} />
            <Route path="/order-workflow" component={OrderWorkflow} />
            <Route path="/credit-agreements" component={CreditAgreements} />
            <Route path="/eway-bills" component={EwayBills} />
            <Route path="/sales" component={Sales} />
            <Route path="/purchase-orders" component={PurchaseOrders} />
            <Route path="/team-performance" component={TeamPerformance} />
            <Route path="/sales-rates" component={SalesRates} />
            <Route path="/pricing" component={Pricing} />

            <Route path="/user-management" component={UserManagement} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
