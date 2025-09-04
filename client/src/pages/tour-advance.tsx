import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Trash2, FileText, Edit, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Tour Advance Form Schema
const tourAdvanceFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  employeeCode: z.string().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().optional(),
  phoneNo: z.string().optional(),
  
  // Additional fields from screenshot
  stateName: z.string().optional(),
  partyVisit: z.string().optional(),
  salesPersonId: z.string().optional(),
  purposeOfTrip: z.string().optional(),
  
  tourStartDate: z.date({ required_error: "Tour start date is required" }),
  tourEndDate: z.date({ required_error: "Tour end date is required" }),
  numberOfDays: z.number().min(1, "Number of days must be at least 1"),
  
  mainDestination: z.string().min(1, "Main destination is required"),
  modeOfTravel: z.enum(["AIR", "TRAIN", "CAR", "BUS", "OTHER"], { required_error: "Mode of travel is required" }),
  vehicleNumber: z.string().optional(),
  purposeOfJourney: z.array(z.enum(["CLIENT_VISIT", "PLANT_VISIT", "PARTY_MEETING", "DEPARTMENT_VISIT", "OTHERS"])).optional(),
  purposeRemarks: z.string().optional(),
  
  advanceRequired: z.boolean().default(false),
  advanceAmountRequested: z.number().optional(),
  sanctionAmountApproved: z.number().optional(),
  sanctionAuthority: z.string().optional(),
  
  status: z.enum(["DRAFT", "SUBMITTED", "RECOMMENDED", "APPROVED", "REJECTED", "SETTLED"]).default("DRAFT"),
  
  segments: z.array(z.object({
    segmentNumber: z.number(),
    departureDate: z.date(),
    departureTime: z.string(),
    arrivalDate: z.date(),
    arrivalTime: z.string(),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
  })).optional()
});

type TourAdvanceFormData = z.infer<typeof tourAdvanceFormSchema>;

const travelModeOptions = [
  { value: "AIR", label: "Air" },
  { value: "TRAIN", label: "Train" },
  { value: "CAR", label: "Car" },
  { value: "BUS", label: "Bus" },
  { value: "OTHER", label: "Other" },
];

const purposeOptions = [
  { value: "CLIENT_VISIT", label: "Client Visit" },
  { value: "PLANT_VISIT", label: "Plant Visit" },
  { value: "PARTY_MEETING", label: "Party Meeting" },
  { value: "DEPARTMENT_VISIT", label: "Department Visit" },
  { value: "OTHERS", label: "Others" },
];

const statusOptions = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "SUBMITTED", label: "Submitted", color: "bg-blue-100 text-blue-800" },
  { value: "RECOMMENDED", label: "Recommended", color: "bg-yellow-100 text-yellow-800" },
  { value: "APPROVED", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "SETTLED", label: "Settled", color: "bg-purple-100 text-purple-800" },
];

// Expense Tracking Component
function ExpenseTrackingTable({ numberOfDays, tourStartDate }: { numberOfDays: number, tourStartDate: Date }) {
  const [expenses, setExpenses] = useState<{ [key: string]: { [key: string]: number } }>({});

  const expenseCategories = [
    { id: "FOOD_ACCOMMODATION", label: "Food & Accommodation", color: "bg-blue-50" },
    { id: "TRAVEL_OTHER", label: "Travel & Other", color: "bg-green-50" },
    { id: "ENTERTAINMENT", label: "Entertainment", color: "bg-purple-50" },
    { id: "MISCELLANEOUS", label: "Miscellaneous", color: "bg-orange-50" },
  ];

  // Generate array of dates based on tour duration
  const getDatesArray = () => {
    const dates = [];
    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(tourStartDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDatesArray();

  // Handle expense change
  const handleExpenseChange = (category: string, dayIndex: number, amount: string) => {
    setExpenses(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [dayIndex]: parseFloat(amount) || 0
      }
    }));
  };

  // Calculate daily totals
  const getDayTotal = (dayIndex: number) => {
    return expenseCategories.reduce((total, category) => {
      return total + (expenses[category.id]?.[dayIndex] || 0);
    }, 0);
  };

  // Calculate category totals
  const getCategoryTotal = (categoryId: string) => {
    const categoryExpenses = expenses[categoryId] || {};
    return Object.values(categoryExpenses).reduce((total, amount) => total + amount, 0);
  };

  // Calculate grand total
  const getGrandTotal = () => {
    return expenseCategories.reduce((total, category) => {
      return total + getCategoryTotal(category.id);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Expense Category</th>
                {dates.map((date, index) => (
                  <th key={index} className="text-center p-3 font-medium min-w-[120px]">
                    <div className="text-sm">Day {index + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(date, "MMM dd")}
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-medium bg-blue-100">Total</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((category) => (
                <tr key={category.id} className={`border-b ${category.color}`}>
                  <td className="p-3 font-medium">{category.label}</td>
                  {dates.map((_, dayIndex) => (
                    <td key={dayIndex} className="p-3">
                      <Input
                        type="number"
                        placeholder="0"
                        className="text-center"
                        value={expenses[category.id]?.[dayIndex]?.toString() || ""}
                        onChange={(e) => handleExpenseChange(category.id, dayIndex, e.target.value)}
                        data-testid={`input-expense-${category.id}-day-${dayIndex}`}
                      />
                    </td>
                  ))}
                  <td className="p-3 text-center font-medium bg-blue-100">
                    ₹{getCategoryTotal(category.id).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Daily Totals Row */}
              <tr className="border-b bg-gray-100 font-medium">
                <td className="p-3">Daily Total</td>
                {dates.map((_, dayIndex) => (
                  <td key={dayIndex} className="p-3 text-center">
                    ₹{getDayTotal(dayIndex).toFixed(2)}
                  </td>
                ))}
                <td className="p-3 text-center bg-blue-200 font-bold">
                  ₹{getGrandTotal().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary */}
      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <span className="font-medium">Total Tour Expenses:</span>
        <span className="text-2xl font-bold text-blue-600">₹{getGrandTotal().toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function TourAdvance() {
  const [selectedTourAdvance, setSelectedTourAdvance] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tour advances
  const { data: tourAdvances = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tour-advances"],
  });

  // Fetch users for employee selection
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<TourAdvanceFormData>({
    resolver: zodResolver(tourAdvanceFormSchema),
    defaultValues: {
      employeeId: "",
      employeeName: "",
      designation: "",
      department: "",
      phoneNo: "",
      stateName: "",
      partyVisit: "",
      salesPersonId: "",
      purposeOfTrip: "",
      tourStartDate: new Date(),
      tourEndDate: new Date(),
      numberOfDays: 1,
      mainDestination: "",
      modeOfTravel: "TRAIN",
      vehicleNumber: "",
      purposeOfJourney: ["CLIENT_VISIT"],
      purposeRemarks: "",
      advanceRequired: false,
      advanceAmountRequested: 0,
      sanctionAmountApproved: 0,
      sanctionAuthority: "",
      status: "DRAFT",
      segments: [
        {
          segmentNumber: 1,
          departureDate: new Date(),
          departureTime: "09:00",
          arrivalDate: new Date(),
          arrivalTime: "18:00",
          fromLocation: "",
          toLocation: "",
        }
      ]
    },
  });

  const { fields: segments, append: appendSegment, remove: removeSegment } = useFieldArray({
    control: form.control,
    name: "segments",
  });

  // Watch form values for calculations
  const tourStartDate = form.watch("tourStartDate");
  const tourEndDate = form.watch("tourEndDate");
  const selectedEmployee = form.watch("employeeId");

  // Auto-calculate number of days
  useEffect(() => {
    if (tourStartDate && tourEndDate) {
      const days = Math.max(1, differenceInDays(tourEndDate, tourStartDate) + 1);
      form.setValue("numberOfDays", days);
    }
  }, [tourStartDate, tourEndDate, form]);

  // Auto-fill employee details
  useEffect(() => {
    if (selectedEmployee) {
      const employee = users.find((u: any) => u.id === selectedEmployee);
      if (employee) {
        form.setValue("employeeName", `${employee.firstName} ${employee.lastName}`);
        form.setValue("designation", employee.designation || "");
        form.setValue("department", employee.department || "");
        form.setValue("phoneNo", employee.mobileNumber || "");
        form.setValue("employeeCode", employee.employeeCode || "");
      }
    }
  }, [selectedEmployee, users, form]);

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: TourAdvanceFormData) => {
      if (selectedTourAdvance) {
        return apiRequest(`/api/tour-advances/${selectedTourAdvance.id}`, "PUT", data);
      } else {
        return apiRequest("/api/tour-advances", "POST", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-advances"] });
      toast({
        title: selectedTourAdvance ? "Tour Advance Updated" : "Tour Advance Created",
        description: `Tour advance has been ${selectedTourAdvance ? "updated" : "created"} successfully.`,
      });
      setIsFormOpen(false);
      setSelectedTourAdvance(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${selectedTourAdvance ? "update" : "create"} tour advance.`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/tour-advances/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-advances"] });
      toast({
        title: "Tour Advance Deleted",
        description: "Tour advance has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tour advance.",
        variant: "destructive",
      });
    },
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/tour-advances/${id}`, "PUT", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-advances"] });
      toast({
        title: "Status Updated",
        description: "Tour advance status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tour advance status.",
        variant: "destructive",
      });
    },
  });

  // Status update handlers
  const handleStatusUpdate = (id: string, status: string) => {
    statusUpdateMutation.mutate({ id, status });
  };

  // Get workflow action buttons based on current status
  const getWorkflowButtons = (ta: any) => {
    const buttons = [];
    
    switch (ta.status) {
      case "DRAFT":
        buttons.push(
          <Button
            key="submit"
            size="sm"
            variant="default"
            onClick={() => handleStatusUpdate(ta.id, "SUBMITTED")}
            data-testid={`button-submit-ta-${ta.id}`}
          >
            Submit
          </Button>
        );
        break;
        
      case "SUBMITTED":
        buttons.push(
          <Button
            key="recommend"
            size="sm"
            variant="default"
            onClick={() => handleStatusUpdate(ta.id, "RECOMMENDED")}
            data-testid={`button-recommend-ta-${ta.id}`}
          >
            Recommend
          </Button>,
          <Button
            key="reject"
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate(ta.id, "REJECTED")}
            data-testid={`button-reject-ta-${ta.id}`}
          >
            Reject
          </Button>
        );
        break;
        
      case "RECOMMENDED":
        buttons.push(
          <Button
            key="approve"
            size="sm"
            variant="default"
            onClick={() => handleStatusUpdate(ta.id, "APPROVED")}
            data-testid={`button-approve-ta-${ta.id}`}
          >
            Approve
          </Button>,
          <Button
            key="reject"
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate(ta.id, "REJECTED")}
            data-testid={`button-reject-ta-${ta.id}`}
          >
            Reject
          </Button>
        );
        break;
        
      case "APPROVED":
        buttons.push(
          <Button
            key="settle"
            size="sm"
            variant="default"
            onClick={() => handleStatusUpdate(ta.id, "SETTLED")}
            data-testid={`button-settle-ta-${ta.id}`}
          >
            Settle
          </Button>
        );
        break;
        
      default:
        // For REJECTED and SETTLED status, no actions available
        break;
    }
    
    return (
      <div className="flex gap-1">
        {buttons}
      </div>
    );
  };

  const onSubmit = async (data: TourAdvanceFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    try {
      // Convert dates to ISO strings for API
      const formattedData = {
        ...data,
        tourStartDate: data.tourStartDate.toISOString(),
        tourEndDate: data.tourEndDate.toISOString(),
        segments: data.segments?.map(segment => ({
          ...segment,
          departureDate: segment.departureDate.toISOString(),
          arrivalDate: segment.arrivalDate.toISOString(),
        })) || []
      };

      console.log("Formatted data for API:", formattedData);
      createUpdateMutation.mutate(formattedData as any);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tourAdvance: any) => {
    setSelectedTourAdvance(tourAdvance);
    
    // Convert date strings back to Date objects
    const formData = {
      ...tourAdvance,
      tourStartDate: new Date(tourAdvance.tourStartDate),
      tourEndDate: new Date(tourAdvance.tourEndDate),
      purposeOfJourney: tourAdvance.purposeOfJourney || [],
      segments: tourAdvance.segments?.map((segment: any, index: number) => ({
        ...segment,
        segmentNumber: index + 1,
        departureDate: new Date(segment.departureDate),
        arrivalDate: new Date(segment.arrivalDate),
      })) || []
    };

    form.reset(formData);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tour advance?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tour Advance (TA) Management</h1>
          <p className="text-muted-foreground">Manage employee travel advance requests and approvals</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTourAdvance(null);
            form.reset();
            setIsFormOpen(true);
          }}
          data-testid="button-new-tour-advance"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Tour Advance
        </Button>
      </div>

      {/* Tour Advances List */}
      <div className="grid gap-4">
        {tourAdvances.map((ta: any) => (
          <Card key={ta.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ta.employeeName}</CardTitle>
                  <CardDescription>
                    {ta.designation} • {ta.department} • {ta.mainDestination}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(ta.status)}
                  {getWorkflowButtons(ta)}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ta)}
                      data-testid={`button-edit-ta-${ta.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ta.id)}
                      data-testid={`button-delete-ta-${ta.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tour Period:</span>
                  <p>{format(new Date(ta.tourStartDate), "MMM dd")} - {format(new Date(ta.tourEndDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p>{ta.numberOfDays} days</p>
                </div>
                <div>
                  <span className="font-medium">Travel Mode:</span>
                  <p>{ta.modeOfTravel}</p>
                </div>
                <div>
                  <span className="font-medium">Advance:</span>
                  <p>{ta.advanceRequired ? `₹${ta.advanceAmountRequested || 0}` : "Not Required"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tourAdvances.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tour Advances Found</h3>
              <p className="text-muted-foreground mb-4">Create your first tour advance request to get started.</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tour Advance
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Modal/Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedTourAdvance ? "Edit Tour Advance" : "New Tour Advance"}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedTourAdvance(null);
                    form.reset();
                  }}
                  data-testid="button-close-form"
                >
                  ×
                </Button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Employee Details Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Employee Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-employee">
                                  <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.employeeCode})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employeeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Employee name" readOnly data-testid="input-employee-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Designation" data-testid="input-designation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Department" data-testid="input-department" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Phone number" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="State name" data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="partyVisit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Party Visit</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Party visit details" data-testid="input-party-visit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salesPersonId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Person</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sales-person">
                                  <SelectValue placeholder="Select sales person" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.filter((user: any) => ['SALES_MANAGER', 'SALES_EXECUTIVE'].includes(user.role)).map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purposeOfTrip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose of Trip</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Purpose of trip" data-testid="input-purpose" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Tour Details Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tour Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="tourStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Tour Start Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-start-date"
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tourEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Tour End Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-end-date"
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numberOfDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Days</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                readOnly
                                className="bg-muted"
                                data-testid="input-number-of-days"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Travel Details Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Travel Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mainDestination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Destination *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Main destination" data-testid="input-destination" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="modeOfTravel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode of Travel *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-travel-mode">
                                    <SelectValue placeholder="Select travel mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {travelModeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicleNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Vehicle number (if applicable)" data-testid="input-vehicle-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="purposeOfJourney"
                        render={() => (
                          <FormItem>
                            <FormLabel>Purpose of Journey *</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {purposeOptions.map((purpose) => (
                                <FormField
                                  key={purpose.value}
                                  control={form.control}
                                  name="purposeOfJourney"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(purpose.value as any)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, purpose.value])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== purpose.value
                                                    )
                                                  )
                                            }}
                                            data-testid={`checkbox-purpose-${purpose.value}`}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                          {purpose.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purposeRemarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose Remarks</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional details about the purpose..." data-testid="textarea-purpose-remarks" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Advance/Financials Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Advance & Financials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="advanceRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-advance-required"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Advance Required</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Check if advance payment is needed for this tour
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("advanceRequired") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="advanceAmountRequested"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Advance Amount Requested</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    data-testid="input-advance-amount"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sanctionAuthority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sanction Authority</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Sanction authority" data-testid="input-sanction-authority" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tour Segments Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Tour Segments</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendSegment({
                              segmentNumber: segments.length + 1,
                              departureDate: new Date(),
                              departureTime: "09:00",
                              arrivalDate: new Date(),
                              arrivalTime: "18:00",
                              fromLocation: "",
                              toLocation: "",
                            })
                          }
                          data-testid="button-add-segment"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Segment
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {segments.map((segment, index) => (
                        <Card key={segment.id} className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Segment {index + 1}</h4>
                            {segments.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSegment(index)}
                                data-testid={`button-remove-segment-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`segments.${index}.departureDate`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Departure Date</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                            data-testid={`button-departure-date-${index}`}
                                          >
                                            {field.value ? format(field.value, "MMM dd") : "Date"}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date("1900-01-01")}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`segments.${index}.departureTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} data-testid={`input-departure-time-${index}`} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`segments.${index}.arrivalDate`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Arrival Date</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                            data-testid={`button-arrival-date-${index}`}
                                          >
                                            {field.value ? format(field.value, "MMM dd") : "Date"}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date("1900-01-01")}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`segments.${index}.arrivalTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} data-testid={`input-arrival-time-${index}`} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              <FormField
                                control={form.control}
                                name={`segments.${index}.fromLocation`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>From Location</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="From location" data-testid={`input-from-location-${index}`} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`segments.${index}.toLocation`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>To Location</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="To location" data-testid={`input-to-location-${index}`} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Expense Tracking Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Expense Tracking</CardTitle>
                      <CardDescription>Track your daily expenses for each day of the tour</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExpenseTrackingTable 
                        numberOfDays={form.watch("numberOfDays")}
                        tourStartDate={form.watch("tourStartDate")}
                      />
                    </CardContent>
                  </Card>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsFormOpen(false);
                        setSelectedTourAdvance(null);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUpdateMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createUpdateMutation.isPending
                        ? "Saving..."
                        : selectedTourAdvance
                        ? "Update Tour Advance"
                        : "Create Tour Advance"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}