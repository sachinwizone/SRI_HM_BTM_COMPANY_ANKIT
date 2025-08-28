# Client Assignment Components (Frontend - Optional)

This file contains React components for managing client assignments. These are optional frontend components that demonstrate how to use the client assignment API.

**INSTRUCTIONS:**
1. Create a new file: `client/src/components/ClientAssignmentDialog.tsx`
2. Copy the content below into that file
3. This provides a complete UI for assigning clients to sales team members

**Features Included:**
- Dialog component for assignment management
- Form for creating new assignments  
- Display of existing assignments
- Support for different assignment types (Primary, Secondary, Backup)

Copy the content below to create `client/src/components/ClientAssignmentDialog.tsx`:

```tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ClientAssignmentDialogProps {
  clientId: string;
  clientName: string;
  children?: React.ReactNode;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
}

interface ClientAssignment {
  id: string;
  clientId: string;
  salesPersonId: string;
  assignmentType: 'PRIMARY' | 'SECONDARY' | 'BACKUP';
  assignedDate: string;
  assignedBy: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export function ClientAssignmentDialog({ clientId, clientName, children }: ClientAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [assignmentType, setAssignmentType] = useState<'PRIMARY' | 'SECONDARY' | 'BACKUP'>('PRIMARY');
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sales team members
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: open,
  });

  // Fetch existing assignments for this client
  const { data: assignments = [] } = useQuery<ClientAssignment[]>({
    queryKey: ['/api/client-assignments/client', clientId],
    enabled: open,
  });

  // Filter users to only show sales team members
  const salesTeamMembers = users.filter(user => 
    ['SALES_MANAGER', 'SALES_EXECUTIVE'].includes(user.role)
  );

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      salesPersonId: string;
      assignmentType: string;
      notes?: string;
    }) => {
      return await apiRequest('/api/client-assignments', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client assignment created successfully",
      });
      // Reset form
      setSelectedSalesPerson("");
      setAssignmentType('PRIMARY');
      setNotes("");
      // Refresh assignments
      queryClient.invalidateQueries({ queryKey: ['/api/client-assignments/client', clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  // Assign as primary mutation
  const assignPrimaryMutation = useMutation({
    mutationFn: async (salesPersonId: string) => {
      return await apiRequest(`/api/clients/${clientId}/assign-primary`, {
        method: 'POST',
        body: JSON.stringify({ salesPersonId }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Primary sales person assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-assignments/client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to assign primary sales person",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedSalesPerson) {
      toast({
        title: "Error",
        description: "Please select a sales person",
        variant: "destructive",
      });
      return;
    }

    if (assignmentType === 'PRIMARY') {
      assignPrimaryMutation.mutate(selectedSalesPerson);
    } else {
      createAssignmentMutation.mutate({
        clientId,
        salesPersonId: selectedSalesPerson,
        assignmentType,
        notes: notes || undefined,
      });
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'PRIMARY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECONDARY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BACKUP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSalesPersonName = (salesPersonId: string) => {
    const user = users.find(u => u.id === salesPersonId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Sales Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Sales Team - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Assignments */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Current Assignments</h3>
            {assignments.length === 0 ? (
              <p className="text-gray-500 text-sm">No assignments yet</p>
            ) : (
              <div className="space-y-2">
                {assignments
                  .filter(a => a.isActive)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getAssignmentTypeColor(assignment.assignmentType)}>
                          {assignment.assignmentType}
                        </Badge>
                        <span className="font-medium">
                          {getSalesPersonName(assignment.salesPersonId)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Assigned on{' '}
                          {new Date(assignment.assignedDate).toLocaleDateString()}
                        </span>
                      </div>
                      {assignment.notes && (
                        <span className="text-sm text-gray-600 italic">
                          "{assignment.notes}"
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Add New Assignment Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Add New Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesPerson">Sales Person</Label>
                <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales person" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesTeamMembers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignmentType">Assignment Type</Label>
                <Select 
                  value={assignmentType} 
                  onValueChange={(value: 'PRIMARY' | 'SECONDARY' | 'BACKUP') => setAssignmentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIMARY">Primary Sales Person</SelectItem>
                    <SelectItem value="SECONDARY">Secondary Support</SelectItem>
                    <SelectItem value="BACKUP">Backup Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this assignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                {assignmentType === 'PRIMARY' && (
                  <p className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Primary assignment will replace any existing primary
                  </p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!selectedSalesPerson || createAssignmentMutation.isPending || assignPrimaryMutation.isPending}
                data-testid="button-create-assignment"
              >
                {createAssignmentMutation.isPending || assignPrimaryMutation.isPending ? (
                  "Assigning..."
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a hook for getting client assignments
export function useClientAssignments(clientId: string) {
  return useQuery<ClientAssignment[]>({
    queryKey: ['/api/client-assignments/client', clientId],
    enabled: !!clientId,
  });
}

// Export a hook for getting my assigned clients
export function useMyClients() {
  return useQuery({
    queryKey: ['/api/my-clients'],
  });
}

// Bulk assignment dialog component
interface BulkAssignmentDialogProps {
  selectedClientIds: string[];
  onComplete: () => void;
  children?: React.ReactNode;
}

export function BulkAssignmentDialog({ selectedClientIds, onComplete, children }: BulkAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [assignmentType, setAssignmentType] = useState<'PRIMARY' | 'SECONDARY' | 'BACKUP'>('PRIMARY');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: open,
  });

  const salesTeamMembers = users.filter(user => 
    ['SALES_MANAGER', 'SALES_EXECUTIVE'].includes(user.role)
  );

  const bulkAssignMutation = useMutation({
    mutationFn: async (data: {
      clientIds: string[];
      salesPersonId: string;
      assignmentType: string;
    }) => {
      return await apiRequest('/api/client-assignments/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedClientIds.length} clients assigned successfully`,
      });
      setOpen(false);
      onComplete();
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign clients",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedSalesPerson) {
      toast({
        title: "Error",
        description: "Please select a sales person",
        variant: "destructive",
      });
      return;
    }

    bulkAssignMutation.mutate({
      clientIds: selectedClientIds,
      salesPersonId: selectedSalesPerson,
      assignmentType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Bulk Assign ({selectedClientIds.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Assign Clients</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Assign {selectedClientIds.length} selected clients to a sales team member.
          </p>

          <div className="space-y-2">
            <Label>Sales Person</Label>
            <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales person" />
              </SelectTrigger>
              <SelectContent>
                {salesTeamMembers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <Select 
              value={assignmentType} 
              onValueChange={(value: 'PRIMARY' | 'SECONDARY' | 'BACKUP') => setAssignmentType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIMARY">Primary Sales Person</SelectItem>
                <SelectItem value="SECONDARY">Secondary Support</SelectItem>
                <SelectItem value="BACKUP">Backup Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedSalesPerson || bulkAssignMutation.isPending}
              data-testid="button-bulk-assign"
            >
              {bulkAssignMutation.isPending ? "Assigning..." : "Assign Clients"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**USAGE EXAMPLE:**

To use these components in your Clients page, add this to your client list:

```tsx
import { ClientAssignmentDialog, BulkAssignmentDialog } from "@/components/ClientAssignmentDialog";

// In your client row:
<ClientAssignmentDialog clientId={client.id} clientName={client.name}>
  <Button variant="ghost" size="sm">
    <UserPlus className="w-4 h-4" />
  </Button>
</ClientAssignmentDialog>

// For bulk operations:
<BulkAssignmentDialog 
  selectedClientIds={selectedClientIds} 
  onComplete={() => setSelectedClientIds([])}
/>
```

**NEXT STEP**: After copying this file, you can proceed to test the complete client assignment system.