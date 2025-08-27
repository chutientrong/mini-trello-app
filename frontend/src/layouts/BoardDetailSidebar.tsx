import { Crown, UserPlus, Users } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "../components";
import { InviteMemberModal } from "../features/boards/components/InviteMemberModal";
import { useBoardMembers } from "../features/boards/hooks/useBoardMembers";
import { useBoard } from "../features/boards/hooks/useBoards";

export const BoardDetailSidebar: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const {
    data: board,
    isLoading: boardLoading,
    error: boardError,
  } = useBoard(boardId!);
  const { data: membersData, isLoading: membersLoading } = useBoardMembers(
    boardId!
  );
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (boardLoading || membersLoading) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </aside>
    );
  }

  if (boardError || !board) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
        <div className="p-4">
          <div className="text-red-600 text-sm">Error loading board</div>
        </div>
      </aside>
    );
  }

  const boardData = board.board;
  const members = membersData?.members || [];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      {/* Board Title */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 truncate">
          {boardData.name}
        </h1>
        {boardData.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {boardData.description}
          </p>
        )}
      </div>

      {/* Members Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-900">Members</h2>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {/* Board Members */}
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {member.fullName?.charAt(0).toUpperCase() || ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {member.fullName}
                  </span>
                  {member.role === "owner" && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {members.length === 0 && (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No members yet</p>
              <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Invite members
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        boardId={boardId!}
      />
    </aside>
  );
};
