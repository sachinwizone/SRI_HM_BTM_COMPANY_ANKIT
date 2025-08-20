import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CreditPayments from "@/pages/credit-payments";
import ClientManagement from "@/pages/client-management";
import ClientTracking from "@/pages/client-tracking";
import TaskManagement from "@/pages/task-management";
import OrderWorkflow from "@/pages/order-workflow";
import CreditAgreements from "@/pages/credit-agreements";
import EwayBills from "@/pages/eway-bills";
import PurchaseOrders from "@/pages/purchase-orders";
import TeamPerformance from "@/pages/team-performance";
import SalesRates from "@/pages/sales-rates";
import Pricing from "@/pages/pricing";
import TallyIntegration from "@/pages/tally-integration";
import AuthPage from "@/pages/auth";
import { useAuth } from "@/hooks/useAuth";

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
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/credit-payments" component={CreditPayments} />
      <Route path="/client-management" component={ClientManagement} />
      <Route path="/client-tracking" component={ClientTracking} />
      <Route path="/task-management" component={TaskManagement} />
      <Route path="/order-workflow" component={OrderWorkflow} />
      <Route path="/credit-agreements" component={CreditAgreements} />
      <Route path="/eway-bills" component={EwayBills} />
      <Route path="/purchase-orders" component={PurchaseOrders} />
      <Route path="/team-performance" component={TeamPerformance} />
      <Route path="/sales-rates" component={SalesRates} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/tally-integration" component={TallyIntegration} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
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
