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
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const onCreateSubmit = (data: RegisterRequest) => {
    const permissionsArray = Object.entries(selectedPermissions)
      .flatMap(([module, actions]) => 
        actions.map(action => ({ module, action, granted: true }))
      );
    
    createUserMutation.mutate({
      ...data,
      permissions: permissionsArray
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
    
    // Initialize edit permissions from user's existing permissions
    const userPermissions: {[key: string]: string[]} = {};
    if (user.permissions) {
      user.permissions.forEach(permission => {
        if (!userPermissions[permission.module]) {
          userPermissions[permission.module] = [];
        }
        if (permission.granted) {
          userPermissions[permission.module].push(permission.action);
        }
      });
    }
    setEditPermissions(userPermissions);
    editForm.reset({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const onEditSubmit = (data: EditUserRequest) => {
    if (!editingUser) return;
    
    // Remove empty password field
    const updateData = { ...data };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    updateUserMutation.mutate({ 
      id: editingUser.id, 
      data: updateData 
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      deleteUserMutation.mutate(userId);
    }
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will be able to login with these credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="First name"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Last name"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Choose username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={form.watch("role")} 
                  onValueChange={(value) => form.setValue("role", value as any)}
                >
                  <SelectTrigger>
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

              {/* Permissions Management */}
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">Module Permissions</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Select which modules and actions this user can access. Admins have full access by default.
                </p>
                
                <ScrollArea className="h-64 w-full border rounded-md p-4">
                  <div className="space-y-4">
                    {MODULES.map((module) => {
                      const modulePermissions = selectedPermissions[module.value] || [];
                      const hasAllActions = ACTIONS.every(action => modulePermissions.includes(action.value));
                      const hasViewPermission = modulePermissions.includes('VIEW');
                      
                      return (
                        <div key={module.value} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`module-${module.value}`}
                                checked={hasAllActions}
                                onCheckedChange={() => toggleAllActionsForModule(module.value, true)}
                                data-testid={`checkbox-module-${module.value}`}
                              />
                              <Label 
                                htmlFor={`module-${module.value}`} 
                                className="font-medium cursor-pointer"
                              >
                                {module.label}
                              </Label>
                            </div>
                            <Badge variant={hasViewPermission ? "default" : "secondary"}>
                              {modulePermissions.length} actions
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 ml-6">
                            {ACTIONS.map((action) => {
                              const Icon = action.icon;
                              const isChecked = modulePermissions.includes(action.value);
                              
                              return (
                                <div key={action.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${module.value}-${action.value}`}
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(module.value, action.value, true)}
                                    data-testid={`checkbox-${module.value}-${action.value}`}
                                  />
                                  <div className="flex items-center space-x-1">
                                    <Icon className="h-3 w-3" />
                                    <Label 
                                      htmlFor={`${module.value}-${action.value}`}
                                      className="text-xs cursor-pointer"
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Leave password blank to keep current password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    {...editForm.register("firstName")}
                    placeholder="Enter first name"
                  />
                  {editForm.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {editForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    {...editForm.register("lastName")}
                    placeholder="Enter last name"
                  />
                  {editForm.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {editForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register("email")}
                  placeholder="Enter email address"
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  {...editForm.register("username")}
                  placeholder="Choose username"
                />
                {editForm.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editForm.watch("role")} 
                  onValueChange={(value) => editForm.setValue("role", value as any)}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  {...editForm.register("password")}
                  placeholder="Leave blank to keep current password"
                />
                {editForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.password.message}
                  </p>
                )}
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
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
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