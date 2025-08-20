import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Download, Archive, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkManagerProps<T> {
  items: T[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkAction: (action: string, ids: string[]) => void;
  entityType: 'tasks' | 'clients' | 'sales' | 'follow-ups';
}

export function BulkManager<T extends { id: string }>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
  entityType
}: BulkManagerProps<T>) {
  const [bulkAction, setBulkAction] = useState("");
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedItems.length === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select items and an action",
        variant: "destructive"
      });
      return;
    }

    onBulkAction(bulkAction, selectedItems);
    setBulkAction("");
  };

  const getActionOptions = () => {
    switch (entityType) {
      case 'tasks':
        return [
          { value: 'complete', label: 'Mark Complete', icon: CheckSquare },
          { value: 'delete', label: 'Delete', icon: Trash2 },
          { value: 'export', label: 'Export', icon: Download },
          { value: 'archive', label: 'Archive', icon: Archive }
        ];
      case 'clients':
        return [
          { value: 'export', label: 'Export', icon: Download },
          { value: 'update-category', label: 'Update Category', icon: Edit },
          { value: 'archive', label: 'Archive', icon: Archive }
        ];
      case 'sales':
        return [
          { value: 'export', label: 'Export', icon: Download },
          { value: 'update-status', label: 'Update Status', icon: Edit },
          { value: 'generate-report', label: 'Generate Report', icon: Download }
        ];
      case 'follow-ups':
        return [
          { value: 'complete', label: 'Mark Complete', icon: CheckSquare },
          { value: 'export', label: 'Export', icon: Download },
          { value: 'reassign', label: 'Reassign', icon: Edit }
        ];
      default:
        return [];
    }
  };

  if (items.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.length === items.length}
              onCheckedChange={handleSelectAll}
              className="border-2"
            />
            <span className="text-sm font-medium">
              Select All ({selectedItems.length} of {items.length})
            </span>
          </div>

          {selectedItems.length > 0 && (
            <>
              <Badge variant="secondary" className="ml-auto sm:ml-0">
                {selectedItems.length} selected
              </Badge>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Choose action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getActionOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="whitespace-nowrap"
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}