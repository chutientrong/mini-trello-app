import { Button, Dropdown } from "@/components";
import { Plus } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import type { BoardMember } from "@/features/boards/types";

interface MemberDropdownProps {
  members: BoardMember[];
  assignedMembers: string[];
  onAssignMember: (memberId: string) => Promise<void>;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

const MemberDropdownComponent: React.FC<MemberDropdownProps> = ({
  members,
  assignedMembers,
  onAssignMember,
  trigger,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize filtered members to avoid unnecessary re-computations
  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        member.userId?.toLowerCase().includes(searchTerm?.toLowerCase())
      ),
    [members, searchTerm]
  );

  const handleAssignMember = useCallback(
    async (memberId: string) => {
      if (assignedMembers.includes(memberId)) return;

      try {
        await onAssignMember(memberId);
      } catch (error) {
        console.error("Failed to assign member:", error);
      }
    },
    [assignedMembers, onAssignMember]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Memoize default trigger to prevent unnecessary re-renders
  const defaultTrigger = useMemo(
    () => (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 rounded-full h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    ),
    []
  );

  // Memoize dropdown items to prevent unnecessary re-renders
  const dropdownItems = useMemo(
    () =>
      filteredMembers.map((member) => {
        const isAssigned = assignedMembers.includes(member.userId);

        return {
          id: member.userId,
          label: member.fullName,
          icon: (
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {member.fullName?.charAt(0).toUpperCase() || ""}
            </div>
          ),
          onClick: () => {
            if (!isAssigned) {
              handleAssignMember(member.userId);
            }
          },
          disabled: isAssigned,
        };
      }),
    [filteredMembers, assignedMembers, handleAssignMember]
  );

  return (
    <Dropdown
      trigger={trigger || defaultTrigger}
      items={dropdownItems}
      align="left"
      // className="w-80"
      hasSearch={true}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search members..."
    />
  );
};

export const MemberDropdown = memo(MemberDropdownComponent);
