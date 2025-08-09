import { Check, X, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  // Core Business Management Features
  {
    name: "Credit Payment Automation",
    description: "Automated payment tracking, due date alerts, and overdue notifications",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Client Categorization (Alfa, Beta, Gamma, Delta)",
    description: "Smart client classification system with custom categories",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Task Classification (One-time vs Recurring)",
    description: "Comprehensive task management with automatic scheduling",
    basic: "Limited",
    advanced: true,
    premium: true
  },
  {
    name: "Order Workflow Automation",
    description: "Complete order lifecycle from agreement to delivery",
    basic: "Basic",
    advanced: true,
    premium: true
  },
  {
    name: "Credit Agreement Enforcement",
    description: "Automatic credit verification before material loading",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Sales Team PO Access",
    description: "Role-based purchase order management and approval",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "E-way Bill Validity Extension",
    description: "Automated e-way bill management with extension capabilities",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Client-wise Tracking (Vehicle Location & Timeline)",
    description: "Real-time vehicle tracking with delivery timeline updates",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Pending Payment Alerts",
    description: "Smart notification system for payment follow-ups",
    basic: "Email only",
    advanced: "Multi-channel",
    premium: "Advanced AI"
  },
  {
    name: "Client-wise Sales Rate Display",
    description: "Dynamic pricing and rate management per client",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Payment Due Alerts",
    description: "Automated reminder system with escalation rules",
    basic: "Basic",
    advanced: "Advanced",
    premium: "AI-powered"
  },
  {
    name: "Sales Team Performance Dashboard",
    description: "Comprehensive analytics and performance metrics",
    basic: false,
    advanced: true,
    premium: true
  },
  // System Features
  {
    name: "User Limit",
    description: "Maximum number of system users",
    basic: "10 users",
    advanced: "50 users",
    premium: "Unlimited"
  },
  {
    name: "Data Storage",
    description: "Database storage capacity",
    basic: "5 GB",
    advanced: "50 GB",
    premium: "Unlimited"
  },
  {
    name: "API Access",
    description: "Integration capabilities with third-party systems",
    basic: false,
    advanced: "Limited",
    premium: "Full API"
  },
  {
    name: "Custom Reports",
    description: "Generate custom business reports and analytics",
    basic: "Pre-built only",
    advanced: "Custom reports",
    premium: "Advanced BI"
  },
  {
    name: "Mobile App Access",
    description: "Mobile application for field operations",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Multi-branch Support",
    description: "Manage multiple business locations",
    basic: false,
    advanced: "Up to 5",
    premium: "Unlimited"
  },
  {
    name: "Data Export/Import",
    description: "Bulk data management capabilities",
    basic: "Basic CSV",
    advanced: "Multiple formats",
    premium: "Advanced tools"
  },
  {
    name: "Backup & Recovery",
    description: "Data backup and disaster recovery",
    basic: "Weekly",
    advanced: "Daily",
    premium: "Real-time"
  },
  // Support Features
  {
    name: "Email Support",
    description: "Email-based customer support",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Phone Support",
    description: "Direct phone support access",
    basic: false,
    advanced: "Business hours",
    premium: "24/7"
  },
  {
    name: "Priority Support",
    description: "Faster response times and dedicated support",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Training & Onboarding",
    description: "System training and implementation support",
    basic: "Self-service",
    advanced: "Guided setup",
    premium: "Full service"
  },
  {
    name: "SLA Guarantee",
    description: "Service level agreement with uptime guarantee",
    basic: false,
    advanced: "99.5%",
    premium: "99.9%"
  },
  {
    name: "Custom Integrations",
    description: "Custom integration development services",
    basic: false,
    advanced: false,
    premium: true
  },
  {
    name: "White-label Solution",
    description: "Branded solution with your company branding",
    basic: false,
    advanced: false,
    premium: true
  }
];

const plans = [
  {
    name: "Basic",
    price: "₹1,78,500",
    description: "Essential features for small businesses",
    recommended: false,
    color: "border-green-400 ring-4 ring-green-100 shadow-xl hover:shadow-2xl bg-gradient-to-br from-green-50 to-green-100",
    buttonColor: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
    textColor: "text-green-700",
    priceColor: "text-green-800"
  },
  {
    name: "Advanced",
    price: "₹3,16,500",
    description: "Complete business management solution",
    recommended: true,
    color: "border-yellow-400 ring-4 ring-yellow-100 shadow-xl hover:shadow-2xl transform scale-105 bg-gradient-to-br from-yellow-50 to-orange-100",
    buttonColor: "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-black",
    textColor: "text-orange-700",
    priceColor: "text-orange-800"
  },
  {
    name: "Premium",
    price: "₹3,88,500",
    description: "Enterprise-grade with full customization",
    recommended: false,
    color: "border-purple-400 ring-4 ring-purple-100 shadow-xl hover:shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100",
    buttonColor: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white",
    textColor: "text-purple-700",
    priceColor: "text-purple-800"
  }
];

function FeatureIcon({ available }: { available: boolean | string }) {
  if (typeof available === "string") {
    return <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{available}</span>;
  }
  
  return available ? (
    <Check className="h-6 w-6 text-green-600 font-bold" />
  ) : (
    <X className="h-6 w-6 text-gray-400" />
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-50 via-yellow-50 to-purple-100">
      <div className="container mx-auto px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-8 tracking-tight leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-2xl font-semibold text-gray-800 max-w-5xl mx-auto leading-relaxed">
            Select the perfect plan for your business management needs. All plans include core functionality with varying levels of advanced features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-10 mb-20">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative ${plan.color} transition-all duration-300`}>
              {plan.recommended && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 text-base font-black shadow-lg">
                    <Star className="h-5 w-5 mr-2 fill-black" />
                    RECOMMENDED
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className={`text-3xl font-black mb-4 ${plan.textColor}`}>{plan.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700 mb-6">
                  {plan.description}
                </CardDescription>
                <div className={`text-5xl font-black mb-2 ${plan.priceColor}`}>
                  {plan.price}
                </div>
                <span className="text-xl font-bold text-gray-600">/year</span>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <Button 
                  className={`w-full mb-8 py-4 text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${plan.buttonColor}`}
                >
                  Get Started
                </Button>
                
                <ul className="space-y-4">
                  {features.slice(0, 8).map((feature, featureIndex) => {
                    const value = plan.name === 'Basic' ? feature.basic : 
                                 plan.name === 'Advanced' ? feature.advanced : 
                                 feature.premium;
                    
                    return (
                      <li key={featureIndex} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-base font-semibold text-gray-800">{feature.name}</span>
                        <FeatureIcon available={value} />
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Feature Comparison Table */}
        <Card className="overflow-hidden shadow-2xl border-4 border-gradient-to-r from-pink-300 via-blue-300 to-purple-300">
          <CardHeader className="bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100 border-b-4 border-gradient-to-r from-pink-300 to-purple-300">
            <CardTitle className="text-4xl font-black text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Complete Feature Comparison
            </CardTitle>
            <CardDescription className="text-xl font-semibold text-center text-gray-700">
              Compare all features across our pricing plans
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-200 via-yellow-200 to-purple-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-black text-gray-900 border-r-4 border-white">
                      Features
                    </th>
                    {plans.map((plan, index) => {
                      const headerColors = [
                        'text-green-800', // Basic
                        'text-orange-800', // Advanced  
                        'text-purple-800'  // Premium
                      ];
                      const bgColors = [
                        'bg-green-100', // Basic
                        'bg-yellow-100', // Advanced
                        'bg-purple-100'  // Premium
                      ];
                      return (
                        <th key={plan.name} className={`px-8 py-6 text-center text-lg font-black border-r-4 border-white last:border-r-0 ${bgColors[index]}`}>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-2xl ${headerColors[index]}`}>{plan.name}</span>
                              {plan.recommended && (
                                <Badge className="text-xs font-bold bg-yellow-400 text-black">
                                  RECOMMENDED
                                </Badge>
                              )}
                            </div>
                            <div className={`text-2xl font-black ${headerColors[index]}`}>{plan.price}</div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                
                <tbody className="divide-y-4 divide-white">
                  {features.map((feature, index) => {
                    const rowColors = index % 2 === 0 
                      ? "bg-gradient-to-r from-gray-50 to-gray-100" 
                      : "bg-gradient-to-r from-blue-50 to-purple-50";
                    return (
                      <tr key={index} className={`${rowColors} hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300`}>
                        <td className="px-8 py-4 text-base font-bold text-gray-900 border-r-4 border-white">
                          <div>
                            <div className="font-black">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm font-medium text-gray-600 mt-1">{feature.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center bg-green-50 border-r-4 border-white">
                          <FeatureIcon available={feature.basic} />
                        </td>
                        <td className="px-8 py-4 text-center bg-yellow-50 border-r-4 border-white">
                          <FeatureIcon available={feature.advanced} />
                        </td>
                        <td className="px-8 py-4 text-center bg-purple-50">
                          <FeatureIcon available={feature.premium} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl font-black text-green-800">Can I upgrade my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-700">
                  Yes, you can upgrade your plan at any time. The price difference will be prorated for the remaining period.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl font-black text-blue-800">Is there a free trial available?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-700">
                  We offer a 30-day free trial for all plans. No credit card required to get started.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl font-black text-purple-800">What support is included?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-700">
                  Basic plan includes email support. Advanced and Premium plans include priority support with faster response times.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl font-black text-orange-800">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-700">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}