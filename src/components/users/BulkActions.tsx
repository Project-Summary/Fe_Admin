// File: components/users/BulkActions.tsx
"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  CheckSquare, 
  UserCheck, 
  UserX, 
  Mail, 
  Trash, 
  ChevronDown,
  AlertTriangle,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserRole } from "@/interface/user.interface";
import { AppDispatch, RootState } from "@/app/redux/store";

interface BulkActionsProps {
  selectedUsers: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  disabled?: boolean;
}

export default function BulkActions({
  selectedUsers,
  onClearSelection,
  onSelectAll,
  disabled = false,
}: BulkActionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogAction, setDialogAction] = useState<{
    type: "activate" | "deactivate" | "delete" | "changeRole" | "export";
    role?: UserRole;
  } | null>(null);

  const selectedCount = selectedUsers.length;

  // Don't render if no users are selected
  if (selectedCount === 0) {
    return null;
  }

  // Get selected user details for display
  const selectedUserDetails = users.filter((user: any) => selectedUsers.includes(user._id));

  const handleOpenDialog = (
    type: "activate" | "deactivate" | "delete" | "changeRole" | "export",
    role?: UserRole
  ) => {
    setDialogAction({ type, role });
    setIsDialogOpen(true);
  };

  const handleBulkActivate = async () => {
    setIsProcessing(true);
    try {
      await dispatch(bulkUpdateUsersThunk({
        data: {
          userIds: selectedUsers,
          updates: { isActive: true }
        },
        onSuccess: () => {
          toast.success(`${selectedCount} users activated successfully`);
          onClearSelection();
        }
      })).unwrap();
    } catch (error) {
      toast.error("Failed to activate users");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsProcessing(true);
    try {
      await dispatch(bulkUpdateUsersThunk({
        data: {
          userIds: selectedUsers,
          updates: { isActive: false }
        },
        onSuccess: () => {
          toast.success(`${selectedCount} users deactivated successfully`);
          onClearSelection();
        }
      })).unwrap();
    } catch (error) {
      toast.error("Failed to deactivate users");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await dispatch(bulkDeleteUsersThunk({
        userIds: selectedUsers,
        onSuccess: () => {
          toast.success(`${selectedCount} users deleted successfully`);
          onClearSelection();
        }
      })).unwrap();
    } catch (error) {
      toast.error("Failed to delete users");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRoleChange = async (role: UserRole) => {
    setIsProcessing(true);
    try {
      await dispatch(bulkUpdateUsersThunk({
        data: {
          userIds: selectedUsers,
          updates: { role }
        },
        onSuccess: () => {
          toast.success(`${selectedCount} users updated to ${role} successfully`);
          onClearSelection();
        }
      })).unwrap();
    } catch (error) {
      toast.error("Failed to update user roles");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportSelected = () => {
    try {
      const exportData = selectedUserDetails.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `selected-users-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`${selectedCount} users exported successfully`);
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  const handleConfirmAction = async () => {
    if (!dialogAction) return;

    switch (dialogAction.type) {
      case "activate":
        await handleBulkActivate();
        break;
      case "deactivate":
        await handleBulkDeactivate();
        break;
      case "delete":
        await handleBulkDelete();
        break;
      case "changeRole":
        if (dialogAction.role) {
          await handleBulkRoleChange(dialogAction.role);
        }
        break;
      case "export":
        handleExportSelected();
        break;
    }

    setIsDialogOpen(false);
    setDialogAction(null);
  };

  const getDialogContent = () => {
    if (!dialogAction) return null;

    switch (dialogAction.type) {
      case "activate":
        return {
          title: "Activate Users",
          description: `Are you sure you want to activate ${selectedCount} selected users?`,
          confirmLabel: "Activate",
        };
      case "deactivate":
        return {
          title: "Deactivate Users",
          description: `Are you sure you want to deactivate ${selectedCount} selected users? Deactivated users will not be able to login.`,
          confirmLabel: "Deactivate",
        };
      case "delete":
        return {
          title: "Delete Users",
          description: `Are you sure you want to delete ${selectedCount} selected users? This action cannot be undone.`,
          confirmLabel: "Delete",
          destructive: true,
        };
      case "changeRole":
        return {
          title: "Change User Role",
          description: `Are you sure you want to change the role of ${selectedCount} selected users to ${dialogAction.role}?`,
          confirmLabel: "Change Role",
        };
      case "export":
        return {
          title: "Export Selected Users",
          description: `Export ${selectedCount} selected users to JSON file?`,
          confirmLabel: "Export",
        };
      default:
        return null;
    }
  };

  const dialogContent = getDialogContent();

  // Count users by role for display
  const roleCount = selectedUserDetails.reduce((acc: any, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  const activeCount = selectedUserDetails.filter((user: any) => user.isActive).length;
  const inactiveCount = selectedCount - activeCount;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background shadow-lg rounded-lg border p-4 w-[90%] max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4" />
              <span>
                <strong>{selectedCount}</strong> users selected
              </span>
            </div>
            
            {/* Selection summary */}
            <div className="flex items-center gap-2">
              {Object.entries(roleCount).map(([role, count]) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}: {count}
                </Badge>
              ))}
              {activeCount > 0 && (
                <Badge variant="default" className="text-xs">
                  Active: {activeCount}
                </Badge>
              )}
              {inactiveCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Inactive: {inactiveCount}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Cancel
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={disabled}
            >
              Select All
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1"
                  disabled={disabled || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Actions"
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={() => handleOpenDialog("activate")}
                  disabled={activeCount === selectedCount}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate Users
                  {inactiveCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {inactiveCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleOpenDialog("deactivate")}
                  disabled={inactiveCount === selectedCount}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate Users
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {activeCount}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Role To</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleOpenDialog("changeRole", UserRole.ADMIN)}
                  disabled={roleCount[UserRole.ADMIN] === selectedCount}
                >
                  Admin
                  {roleCount[UserRole.ADMIN] && (
                    <Badge variant="secondary" className="ml-auto">
                      {roleCount[UserRole.ADMIN]}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenDialog("changeRole", UserRole.MODERATOR)}
                  disabled={roleCount[UserRole.MODERATOR] === selectedCount}
                >
                  Moderator
                  {roleCount[UserRole.MODERATOR] && (
                    <Badge variant="secondary" className="ml-auto">
                      {roleCount[UserRole.MODERATOR]}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenDialog("changeRole", UserRole.USER)}
                  disabled={roleCount[UserRole.USER] === selectedCount}
                >
                  Regular User
                  {roleCount[UserRole.USER] && (
                    <Badge variant="secondary" className="ml-auto">
                      {roleCount[UserRole.USER]}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenDialog("export")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleOpenDialog("delete")}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>
              {dialogContent?.destructive && (
                <div className="flex items-center text-destructive gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>This action cannot be undone.</span>
                </div>
              )}
              {dialogContent?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Show affected users preview */}
          {(dialogAction?.type === "delete" || dialogAction?.type === "changeRole") && (
            <div className="py-4 max-h-40 overflow-y-auto">
              <div className="text-sm font-medium mb-2">Affected users:</div>
              <div className="space-y-1">
                {selectedUserDetails.slice(0, 5).map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between text-sm">
                    <span>{user.name}</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
                {selectedUserDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{selectedUserDetails.length - 5} more users
                  </div>
                )}
              </div>
            </div>
          )}

          {dialogAction?.type === "changeRole" && (
            <div className="py-4">
              <Select
                defaultValue={dialogAction.role}
                onValueChange={(value) =>
                  setDialogAction({
                    ...dialogAction,
                    role: value as UserRole,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                  <SelectItem value={UserRole.USER}>Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={dialogContent?.destructive ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                dialogContent?.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}