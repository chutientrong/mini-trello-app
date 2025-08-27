import React, { useState, memo, useCallback } from "react";
import { Plus } from "lucide-react";
import { CreateBoardModal } from "./CreateBoardModal";
import { Button } from "@/components/Button";

interface CreateBoardCardProps {
  onCreateBoard: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateBoardCardComponent: React.FC<CreateBoardCardProps> = ({
  onCreateBoard,
  isLoading = false,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = useCallback(
    async (name: string, description?: string) => {
      await onCreateBoard(name, description);
      setIsFormOpen(false);
    },
    [onCreateBoard]
  );

  const handleCancel = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleOpenForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  return (
    <>
      <Button
        onClick={handleOpenForm}
        variant="outline"
        size="sm"
        className="w-full h-full min-h-[200px] flex flex-col items-center justify-center group"
      >
        <Plus className="h-8 w-8 text-gray-400 group-hover:text-gray-600 mb-2" />
        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
          Create new board
        </span>
      </Button>

      <CreateBoardModal
        isOpen={isFormOpen}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
};

export const CreateBoardCard = memo(CreateBoardCardComponent);
