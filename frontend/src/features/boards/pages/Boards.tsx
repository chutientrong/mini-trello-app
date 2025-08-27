import React, { memo, useCallback, useMemo } from 'react';
import { BoardCard, CreateBoardCard } from '../components';
import { useBoards, useCreateBoard } from '../hooks/useBoards';
import { LoadingSpinner } from '@/components';

const BoardsComponent: React.FC = () => {
  const { data: boardsData, isLoading, error } = useBoards();
  const createBoardMutation = useCreateBoard();

  const boards = useMemo(() => boardsData?.data || [], [boardsData?.data]);
  
  const handleCreateBoard = useCallback(async (name: string, description?: string) => {
    try {
      await createBoardMutation.mutateAsync({
        name,
        description,
        isPublic: false,
      });
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  }, [createBoardMutation]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading boards</h3>
        <p className="mt-1 text-sm text-gray-500">
          Failed to load boards. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
        <p className="text-gray-600 mt-1">
          Manage your project boards and collaborate with your team
        </p>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Existing Boards */}
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            name={board.name}
            description={board.description}
            cardCount={board.cardCount}
            memberCount={board.memberCount}
          />
        ))}

        {/* Create New Board Card */}
        <CreateBoardCard 
          onCreateBoard={handleCreateBoard}
          isLoading={createBoardMutation.isPending}
        />
      </div>

      {/* Empty State */}
      {boards.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No boards</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new board.
          </p>
        </div>
      )}
    </div>
  );
};

const Boards = memo(BoardsComponent);
export default Boards;