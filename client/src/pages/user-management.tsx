import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterRequest } from "@shared/schema";
import { apiCall } from "@/lib/queryClient";
import { UserIcon, PlusIcon, PencilIcon, TrashIcon, Shield, Eye, Plus, Edit, Trash2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'OPERATIONS';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: UserPermission[];
}

interface UserPermission {
  id: string;
  userId: string;
  module: string;
  action: string;
  granted: boolean;
}

// Modules and Actions for permissions
const MODULES = [
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'CLIENT_MANAGEMENT', label: 'Client Management' },
  { value: 'CLIENT_TRACKING', label: 'Client Tracking' },
  { value: 'ORDER_WORKFLOW', label: 'Order Workflow' },
  { value: 'SALES', label: 'Sales' },
  { value: 'SALES_OPERATIONS', label: 'Sales Operations' },
  { value: 'PURCHASE_ORDERS', label: 'Purchase Orders' },
  { value: 'TASK_MANAGEMENT', label: 'Task Management' },
  { value: 'FOLLOW_UP_HUB', label: 'Follow-up Hub' },
  { value: 'LEAD_FOLLOW_UP_HUB', label: 'Lead Follow-up Hub' },
  { value: 'CREDIT_PAYMENTS', label: 'Credit Payments' },
  { value: 'CREDIT_AGREEMENTS', label: 'Credit Agreements' },
  { value: 'EWAY_BILLS', label: 'E-way Bills' },
  { value: 'SALES_RATES', label: 'Sales Rates' },
  { value: 'TEAM_PERFORMANCE', label: 'Team Performance' },
  { value: 'TOUR_ADVANCE', label: 'Tour Advance' },
  { value: 'TA_REPORTS', label: 'TA Reports' },
  { value: 'MASTER_DATA', label: 'Master Data' },
  { value: 'USER_MANAGEMENT', label: 'User Management' },
  { value: 'PRICING', label: 'Pricing' },
];

const ACTIONS = [
  { value: 'VIEW', label: 'View', icon: Eye },
  { value: 'ADD', label: 'Add', icon: Plus },
  { value: 'EDIT', label: 'Edit', icon: Edit },
  { value: 'DELETE', label: 'Delete', icon: Trash2 },
];

// Edit user schema (password is optional)
interface EditUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'OPERATIONS';
  password?: string;
}

export default function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<{[key: string]: string[]}>({});
  const [editPermissions, setEditPermissions] = useState<{[key: string]: string[]}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "SALES_EXECUTIVE",
      employeeCode: "",
      mobileNumber: "",
      designation: "",
      department: "",
    },
  });

  // Edit form
  const editForm = useForm<EditUserRequest>({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "SALES_EXECUTIVE",
      password: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setSelectedPermissions({});
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create User",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update User",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Deactivate User",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Permission helper functions
  const togglePermission = (module: string, action: string, isCreate = true) => {
    const currentPermissions = isCreate ? selectedPermissions : editPermissions;
    const setPermissions = isCreate ? setSelectedPermissions : setEditPermissions;
    
    const modulePermissions = currentPermissions[module] || [];
    const updated = modulePermissions.includes(action)
      ? modulePermissions.filter(a => a !== action)
      : [...modulePermissions, action];
    
    setPermissions({
      ...currentPermissions,
      [module]: updated
    });
  };

  const toggleAllActionsForModule = (module: string, isCreate = true) => {
    const currentPermissions = isCreate ? selectedPermissions : editPermissions;
    const setPermissions = isCreate ? setSelectedPermissions : setEditPermissions;
    
    const modulePermissions = currentPermissions[module] || [];
    const allActions = ACTIONS.map(a => a.value);
    const hasAllActions = allActions.every(action => modulePermissions.includes(action));
    
    setPermissions({
      ...currentPermissions,
      [module]: hasAllActions ? [] : allActions
    });
  };

  const onCreateSubmit = async (data: RegisterRequest) => {
    const permissionsArray = Object.entries(selectedPermissions)
      .flatMap(([module, actions]) => 
        actions.map(action => ({ module, action, granted: true }))
      );
    
    // First create the user
    createUserMutation.mutate(data, {
      onSuccess: async (newUser: any) => {
        // Then set permissions if any are selected
        if (permissionsArray.length > 0) {
          try {
            await fetch(`/api/users/${newUser.id}/permissions`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(permissionsArray)
            });
          } catch (error) {
            console.error('Failed to set permissions:', error);
          }
        }
      }
    });
  };

  const handleEditUser = async (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
    
    // Fetch user's current permissions from API
    try {
      const response = await fetch(`/api/users/${user.id}/permissions`, {
        credentials: "include"
      });
      
      if (response.ok) {
        const permissions = await response.json();
        const userPermissions: {[key: string]: string[]} = {};
        
        permissions.forEach((permission: any) => {
          if (!userPermissions[permission.module]) {
            userPermissions[permission.module] = [];
          }
          if (permission.granted) {
            userPermissions[permission.module].push(permission.action);
          }
        });
        
        setEditPermissions(userPermissions);
      } else {
        // Fallback to empty permissions if fetch fails
        setEditPermissions({});
      }
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      setEditPermissions({});
    }
    
    editForm.reset({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const onEditSubmit = async (data: EditUserRequest) => {
    if (!editingUser) return;
    
    // Remove empty password field
    const updateData = { ...data };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    // Include permissions in the update
    const permissionsArray = Object.entries(editPermissions)
      .flatMap(([module, actions]) => 
        actions.map(action => ({ module, action, granted: true }))
      );
    
    // First update the user
    updateUserMutation.mutate({ 
      id: editingUser.id, 
      data: updateData
    }, {
      onSuccess: async () => {
        // Then update permissions separately
        if (permissionsArray.length > 0) {
          try {
            await fetch(`/api/users/${editingUser.id}/permissions`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(permissionsArray)
            });
          } catch (error) {
            console.error('Failed to update permissions:', error);
          }
        }
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'SALES_MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'SALES_EXECUTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'OPERATIONS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Create and manage user accounts for the system.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            form.reset();
            setSelectedPermissions({});
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will be able to login with these credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">Basic Information</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="First name"
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Last name"
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter email"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Choose username"
                      className="mt-1"
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                    <Select 
                      value={form.watch("role")} 
                      onValueChange={(value) => form.setValue("role", value as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                        <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                        <SelectItem value="OPERATIONS">Operations</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="employeeCode" className="text-sm font-medium">Employee ID</Label>
                    <Input
                      id="employeeCode"
                      {...form.register("employeeCode")}
                      placeholder="Enter employee ID"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation" className="text-sm font-medium">Designation</Label>
                    <Input
                      id="designation"
                      {...form.register("designation")}
                      placeholder="Enter designation"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <Input
                      id="department"
                      {...form.register("department")}
                      placeholder="Enter department"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobileNumber" className="text-sm font-medium">Phone No.</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      {...form.register("mobileNumber")}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                  <div></div> {/* Empty div for grid spacing */}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="h-4 w-4 text-green-600" />
                  <Label className="text-base font-semibold">Security</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="Choose password"
                      className="mt-1"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...form.register("confirmPassword")}
                      placeholder="Confirm password"
                      className="mt-1"
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <Label className="text-base font-semibold">Module Permissions</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPermissions({})}
                  >
                    Clear All
                  </Button>
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">💡 Tip:</span> Select which modules and actions this user can access. 
                  Click the module checkbox to select all actions for that module. Admins have full access by default.
                </p>
                
                <ScrollArea className="h-80 w-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {MODULES.map((module) => {
                      const modulePermissions = selectedPermissions[module.value] || [];
                      const hasAllActions = ACTIONS.every(action => modulePermissions.includes(action.value));
                      const hasViewPermission = modulePermissions.includes('VIEW');
                      
                      return (
                        <div key={module.value} className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`module-${module.value}`}
                                checked={hasAllActions}
                                onCheckedChange={() => toggleAllActionsForModule(module.value, true)}
                                data-testid={`checkbox-module-${module.value}`}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <Label 
                                htmlFor={`module-${module.value}`} 
                                className="font-medium cursor-pointer text-gray-900 dark:text-white"
                              >
                                {module.label}
                              </Label>
                            </div>
                            <Badge 
                              variant={hasViewPermission ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {modulePermissions.length}/{ACTIONS.length}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 ml-6">
                            {ACTIONS.map((action) => {
                              const Icon = action.icon;
                              const isChecked = modulePermissions.includes(action.value);
                              
                              return (
                                <div key={action.value} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <Checkbox
                                    id={`${module.value}-${action.value}`}
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(module.value, action.value, true)}
                                    data-testid={`checkbox-${module.value}-${action.value}`}
                                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                  />
                                  <div className="flex items-center space-x-1.5">
                                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                                    <Label 
                                      htmlFor={`${module.value}-${action.value}`}
                                      className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
                                    >
                                      {action.label}
                                    </Label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Choose password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder="Confirm password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Leave password blank to keep current password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">Basic Information</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="edit-firstName"
                      {...editForm.register("firstName")}
                      placeholder="Enter first name"
                      className="mt-1"
                    />
                    {editForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="edit-lastName"
                      {...editForm.register("lastName")}
                      placeholder="Enter last name"
                      className="mt-1"
                    />
                    {editForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      {...editForm.register("email")}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                    {editForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="edit-username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="edit-username"
                      {...editForm.register("username")}
                      placeholder="Choose username"
                      className="mt-1"
                    />
                    {editForm.formState.errors.username && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-role" className="text-sm font-medium">Role</Label>
                    <Select 
                      value={editForm.watch("role")} 
                      onValueChange={(value) => editForm.setValue("role", value as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                        <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                        <SelectItem value="OPERATIONS">Operations</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {editForm.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                  <div></div> {/* Empty div for grid spacing */}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="h-4 w-4 text-green-600" />
                  <Label className="text-base font-semibold">Security</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-password" className="text-sm font-medium">New Password (optional)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      {...editForm.register("password")}
                      placeholder="Leave blank to keep current password"
                      className="mt-1"
                    />
                    {editForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {editForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div></div> {/* Empty div for grid spacing */}
                </div>
              </div>

              {/* Permissions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <Label className="text-base font-semibold">Module Permissions</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditPermissions({})}
                  >
                    Clear All
                  </Button>
                </div>
                <p className="text-sm text-gray-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="font-medium">⚠️ Note:</span> Changes to permissions will take effect on the user's next login. 
                  Click the module checkbox to select all actions for that module.
                </p>
                
                <ScrollArea className="h-80 w-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {MODULES.map((module) => {
                      const modulePermissions = editPermissions[module.value] || [];
                      const hasAllActions = ACTIONS.every(action => modulePermissions.includes(action.value));
                      const hasViewPermission = modulePermissions.includes('VIEW');
                      
                      return (
                        <div key={module.value} className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`edit-module-${module.value}`}
                                checked={hasAllActions}
                                onCheckedChange={() => toggleAllActionsForModule(module.value, false)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <Label 
                                htmlFor={`edit-module-${module.value}`} 
                                className="font-medium cursor-pointer text-gray-900 dark:text-white"
                              >
                                {module.label}
                              </Label>
                            </div>
                            <Badge 
                              variant={hasViewPermission ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {modulePermissions.length}/{ACTIONS.length}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 ml-6">
                            {ACTIONS.map((action) => {
                              const Icon = action.icon;
                              const isChecked = modulePermissions.includes(action.value);
                              
                              return (
                                <div key={action.value} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <Checkbox
                                    id={`edit-permission-${module.value}-${action.value}`}
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(module.value, action.value, false)}
                                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                  />
                                  <div className="flex items-center space-x-1.5">
                                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                                    <Label 
                                      htmlFor={`edit-permission-${module.value}-${action.value}`}
                                      className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
                                    >
                                      {action.label}
                                    </Label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View User Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected user
              </DialogDescription>
            </DialogHeader>
            
            {viewingUser && (
              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {viewingUser.firstName[0]}{viewingUser.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {viewingUser.firstName} {viewingUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{viewingUser.username}</p>
                    <Badge className={getRoleColor(viewingUser.role)}>
                      {viewingUser.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <Badge variant={viewingUser.isActive ? "default" : "secondary"}>
                      {viewingUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <Label className="text-base font-semibold">Contact Information</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Email</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {viewingUser.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Username</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {viewingUser.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Shield className="h-4 w-4 text-green-600" />
                    <Label className="text-base font-semibold">Account Information</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">User ID</Label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white mt-1 break-all">
                        {viewingUser.id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Role</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {viewingUser.role.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Account Status</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {viewingUser.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Last Login</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatDate(viewingUser.lastLogin)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Created At</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(viewingUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(viewingUser.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions Summary */}
                {viewingUser.permissions && viewingUser.permissions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <Label className="text-base font-semibold">Permissions Summary</Label>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        This user has permissions for the following modules:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(viewingUser.permissions
                          .filter(p => p.granted)
                          .map(p => p.module)))
                          .map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {MODULES.find(m => m.value === module)?.label || module}
                            </Badge>
                          ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                        Total granted permissions: {viewingUser.permissions.filter(p => p.granted).length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setViewingUser(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (viewingUser) {
                    handleEditUser(viewingUser);
                  }
                }}
              >
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            All users registered in the system with their roles and activity status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <div className="text-sm text-gray-500">Loading users...</div>
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-6">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer text-left"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}