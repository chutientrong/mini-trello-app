import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Users, BarChart3, Calendar } from 'lucide-react';
import { useBoard } from '../hooks/useBoards';
import { useBoardMembers } from '../hooks/useBoardMembers';
import { BoardMembers } from './BoardMembers';
import { LoadingSpinner } from '@/components';

interface BoardDetailSidebarProps {
  className?: string;
}

const BoardDetailSidebarComponent: React.FC<BoardDetailSidebarProps> = ({
  className = '',
}) => {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: boardData, isLoading: boardLoading, error: boardError } = useBoard(boardId!);
  const { data: membersData, isLoading: membersLoading } = useBoardMembers(boardId!);

  if (boardLoading || membersLoading) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (boardError || !boardData?.board) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
        <div className="p-4">
          <div className="text-red-600 text-sm">Error loading board</div>
        </div>
      </div>
    );
  }

  const board = boardData.board;
  const members = membersData?.members || [];

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Board Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">{board.name}</h2>
          {board.description && (
            <p className="text-sm text-gray-600">{board.description}</p>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{board.cardCount} cards</span>
            <span>{board.memberCount} members</span>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Board Members */}
        <div className="p-6">
          <BoardMembers
            members={members}
            ownerId={board.ownerId}
          />
        </div>

        {/* Board Stats */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Board Stats</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{board.cardCount}</div>
                <div className="text-xs text-gray-600">Total Cards</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{board.memberCount}</div>
                <div className="text-xs text-gray-600">Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Actions */}
        <div className="px-6 pb-6">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              <span>Board Settings</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Users className="h-4 w-4" />
              <span>Invite Members</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Activity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BoardDetailSidebar = memo(BoardDetailSidebarComponent);
