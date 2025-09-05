import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function ewaybillsPage() {
  const handleOpenEwayBillPortal = () => {
    window.open("https://ewaybillgst.gov.in/Login.aspx", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Eway Bills</h1>
        <p className="text-gray-600 mt-1">Eway Bills management and overview</p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">GST E-way Bill Portal</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Access the official GST E-way Bill portal to generate, manage, and track your E-way bills for goods transportation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleOpenEwayBillPortal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-open-eway-portal"
            >
              <ExternalLink className="w-4 h-4" />
              Open E-way Bill Portal
            </Button>
            
            <div className="text-sm text-gray-500 flex items-center">
              Opens ewaybillgst.gov.in in a new tab
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Portal Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Generate E-way bills for goods transportation</li>
              <li>• Track and manage existing E-way bills</li>
              <li>• Update vehicle numbers and transporter details</li>
              <li>• Extend validity and cancel E-way bills</li>
              <li>• Download E-way bill reports and summaries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
