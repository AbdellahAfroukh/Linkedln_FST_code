import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { transformUrl } from "@/lib/url-utils";
import { useToast } from "@/components/ui/use-toast";
import { chatsApi } from "@/api/chats";
import { usersApi } from "@/api/users";
import { User } from "@/types";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

export default function CreateGroupDialog({
  open,
  onOpenChange,
  onGroupCreated,
}: CreateGroupDialogProps) {
  const { user: currentUser } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // Fetch all users for group selection
      const response = await usersApi.search("", 0, 100);
      // Filter out current user
      const filtered = response.users.filter((u) => u.id !== currentUser?.id);
      setAvailableUsers(filtered);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.length < 1) {
      toast({
        title: "Error",
        description: "Please select at least one member",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await chatsApi.createGroupChat({
        name: groupName,
        member_ids: [...selectedMembers, currentUser?.id || 0],
      });

      toast({
        title: "Success",
        description: "Group chat created successfully",
      });

      // Reset form
      setGroupName("");
      setSearchQuery("");
      setSelectedMembers([]);
      onOpenChange(false);
      onGroupCreated();
    } catch (error) {
      console.error("Failed to create group:", error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Create a new group chat with multiple members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <Label>Select Members ({selectedMembers.length} selected)</Label>
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />

            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading users...
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg p-3">
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No users found
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                        onClick={() => handleSelectMember(user.id)}
                      >
                        <Checkbox
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={() => handleSelectMember(user.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={transformUrl(user.photoDeProfil)}
                            alt={user.fullName}
                          />
                          <AvatarFallback>
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
