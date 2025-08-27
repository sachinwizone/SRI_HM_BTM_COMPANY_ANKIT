import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Users, CreditCard, Clock, Globe } from "lucide-react";

// Validation schema with your exact requirements
const companyProfileSchema = z.object({
  // 1) Basic Information
  legalName: z.string().min(1, "Legal name is required"),
  tradeName: z.string().optional(),
  entityType: z.enum(["P Ltd", "LLP", "Proprietorship", "Partnership", "Others"]),
  gstin: z.string().length(15, "GSTIN must be 15 characters").optional().or(z.literal("")),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format (AAAAA9999A)").optional().or(z.literal("")),
  cinRegistrationNumber: z.string().optional(),
  yearOfIncorporation: z.number().min(1800).max(new Date().getFullYear()).optional(),
  
  // 2) Addresses - Registered Office
  registeredAddressLine1: z.string().min(1, "Address Line 1 is required"),
  registeredAddressLine2: z.string().optional(),
  registeredCity: z.string().min(1, "City is required"),
  registeredState: z.string().min(1, "State is required"),
  registeredPincode: z.string().length(6, "Pincode must be 6 digits"),
  
  // Corporate Office (Optional)
  corporateAddressLine1: z.string().optional(),
  corporateAddressLine2: z.string().optional(),
  corporateCity: z.string().optional(),
  corporateState: z.string().optional(),
  corporatePincode: z.string().length(6, "Pincode must be 6 digits").optional().or(z.literal("")),
  
  // 3) Contacts - Primary Contact Person
  primaryContactName: z.string().min(1, "Primary contact name is required"),
  primaryContactDesignation: z.string().optional(),
  primaryContactMobile: z.string().length(10, "Mobile must be 10 digits"),
  primaryContactEmail: z.string().email("Invalid email format"),
  
  // Accounts Contact
  accountsContactName: z.string().optional(),
  accountsContactMobile: z.string().length(10, "Mobile must be 10 digits").optional().or(z.literal("")),
  accountsContactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  
  // 4) Banking & Finance
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().length(11, "IFSC code must be 11 characters").optional().or(z.literal("")),
  
  // 5) Business Details
  defaultInvoicePrefix: z.string().default("INV"),
  officeWorkingHours: z.string().regex(/^[0-2][0-9]:[0-5][0-9]–[0-2][0-9]:[0-5][0-9]$/, "Format: HH:MM–HH:MM").optional().or(z.literal("")),
  godownWorkingHours: z.string().regex(/^[0-2][0-9]:[0-5][0-9]–[0-2][0-9]:[0-5][0-9]$/, "Format: HH:MM–HH:MM").optional().or(z.literal("")),
  
  // 6) Digital Settings
  companyWebsiteUrl: z.string().url("Must start with http:// or https://").optional().or(z.literal("")),
  whatsappBusinessNumber: z.string().length(10, "WhatsApp number must be 10 digits").optional().or(z.literal("")),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

// State list for GSTIN auto-derivation
const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman and Diu", "26": "Dadra and Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman and Nicobar Islands", "36": "Telangana"
};

export function CompanyProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gstinState, setGstinState] = useState<string>("");

  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      entityType: "P Ltd",
      defaultInvoicePrefix: "INV",
    },
  });

  // Fetch existing company profile
  const { data: companyProfile, isLoading } = useQuery({
    queryKey: ["/api/company-profile"],
  });

  // Auto-derive state from GSTIN
  const gstinValue = form.watch("gstin");
  useEffect(() => {
    if (gstinValue && gstinValue.length >= 2) {
      const stateCode = gstinValue.substring(0, 2);
      const derivedState = GST_STATE_CODES[stateCode];
      if (derivedState) {
        setGstinState(derivedState);
      }
    } else {
      setGstinState("");
    }
  }, [gstinValue]);

  // Set form values when data is loaded
  useEffect(() => {
    if (companyProfile) {
      form.reset(companyProfile);
    }
  }, [companyProfile, form]);

  // Watch entity type for conditional fields
  const entityType = form.watch("entityType");

  const createMutation = useMutation({
    mutationFn: (data: CompanyProfileFormData) => {
      console.log("Creating company profile with data:", { ...data, gstinState });
      return apiRequest("POST", "/api/company-profile", { ...data, gstinState });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Company profile created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/company-profile"] });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({ title: "Error", description: `Failed to create company profile: ${error.message || 'Unknown error'}`, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CompanyProfileFormData) => {
      console.log("Updating company profile with data:", { ...data, gstinState });
      return apiRequest("PUT", `/api/company-profile/${(companyProfile as any)?.id}`, { ...data, gstinState });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Company profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/company-profile"] });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({ title: "Error", description: `Failed to update company profile: ${error.message || 'Unknown error'}`, variant: "destructive" });
    },
  });

  const onSubmit = (data: CompanyProfileFormData) => {
    if ((companyProfile as any)?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading company profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Company Profile</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* 1) Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Name of Company *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-legal-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade/Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-trade-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Entity *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-entity-type">
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="P Ltd">P Ltd</SelectItem>
                        <SelectItem value="LLP">LLP</SelectItem>
                        <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={15} placeholder="15 characters" data-testid="input-gstin" />
                    </FormControl>
                    {gstinState && <p className="text-sm text-muted-foreground">State: {gstinState}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={10} placeholder="AAAAA9999A" data-testid="input-pan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields for P Ltd */}
              {entityType === "P Ltd" && (
                <>
                  <FormField
                    control={form.control}
                    name="cinRegistrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIN / Registration Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-cin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearOfIncorporation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Incorporation</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-year-incorporation"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* 2) Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registered Office */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Registered Office Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registeredAddressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-registered-address1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredAddressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-registered-address2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-registered-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-registered-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredPincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode *</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={6} data-testid="input-registered-pincode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Corporate Office */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Corporate Office Address (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="corporateAddressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-corporate-address1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corporateAddressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-corporate-address2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corporateCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-corporate-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corporateState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-corporate-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corporatePincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={6} data-testid="input-corporate-pincode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3) Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Primary Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-primary-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactDesignation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-primary-contact-designation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile *</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={10} data-testid="input-primary-contact-mobile" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-primary-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Accounts Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Accounts Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="accountsContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-accounts-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountsContactMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={10} data-testid="input-accounts-contact-mobile" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountsContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-accounts-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4) Banking & Finance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking & Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-bank-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-branch-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={11} placeholder="11 characters" data-testid="input-ifsc-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 5) Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="defaultInvoicePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Invoice Prefix/Series</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-invoice-prefix" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="officeWorkingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Working Hours</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="09:00–18:00" data-testid="input-office-hours" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="godownWorkingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Godown Working Hours</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="08:00–20:00" data-testid="input-godown-hours" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 6) Digital Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Digital Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyWebsiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" data-testid="input-website-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappBusinessNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Business API Number</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={10} data-testid="input-whatsapp-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-company-profile"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Company Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}