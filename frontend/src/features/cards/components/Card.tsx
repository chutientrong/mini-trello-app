import { Button, Dropdown, ConfirmModal } from "@/components";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUpdateTask, useDeleteTask } from "@/features/tasks/hooks/useTasks";
import type { Card as CardType } from "../types/cards";
import type { Task as TaskType } from "@/features/tasks/types/tasks";
import {
  CreateTaskModal,
  Task,
  TaskDetailModal,
} from "@/features/tasks/components";

interface CardProps {
  card: CardType;
  index: number;
  handleToggleTask: (cardId: string, taskId: string) => void;
  handleCreateTask: (
    cardId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  handleUpdateCardTitle: (cardId: string, title: string) => Promise<void>;
  handleDeleteCard: (cardId: string) => Promise<void>;
  isUpdatingTitle?: boolean;
}

const CardComponent: React.FC<CardProps> = ({
  card,
  index,
  handleCreateTask,
  handleUpdateCardTitle,
  handleDeleteCard,
  isUpdatingTitle = false,
}) => {
  const { boardId } = useParams<{ boardId: string }>();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(card.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Use tasks from card data (now provided by backend) or fallback to fetching
  const tasks = card.tasks || [];

  // Task mutations
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Real-time task updates are handled at board level
  // const { isConnected: isRealtimeConnected } = useTaskRealtime({
  //   boardId: boardId!,
  //   cardId: card.id,
  // });

  // Update titleValue when card.title changes (e.g., after successful update)
  useEffect(() => {
    setTitleValue(card.title);
  }, [card.title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditingTitle &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        handleSaveTitle();
      }
    };

    if (isEditingTitle) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditingTitle, titleValue]);

  const handleSaveTitle = useCallback(async () => {
    if (titleValue.trim() && titleValue !== card.title) {
      try {
        await handleUpdateCardTitle(card.id, titleValue.trim());
      } catch {
        // Revert to original title on error
        setTitleValue(card.title);
      }
    } else {
      // Revert to original title if empty or unchanged
      setTitleValue(card.title);
    }
    setIsEditingTitle(false);
  }, [titleValue, card.title, card.id, handleUpdateCardTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSaveTitle();
      } else if (e.key === "Escape") {
        setTitleValue(card.title);
        setIsEditingTitle(false);
      }
    },
    [handleSaveTitle, card.title]
  );

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  const handleAddTaskClick = () => {
    setShowCreateTaskModal(true);
  };

  const handleCreateTaskSubmit = async (
    title: string,
    description?: string
  ) => {
    await handleCreateTask(card.id, title, description);
  };

  const handleCreateTaskCancel = () => {
    setShowCreateTaskModal(false);
  };

  const handleTaskClick = useCallback((task: TaskType) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  }, []);

  const handleTaskDetailClose = useCallback(() => {
    setShowTaskDetailModal(false);
    setSelectedTask(null);
  }, []);

  const handleTaskCompleteChange = useCallback(async (taskId: string, dueComplete: boolean) => {
    try {
      await updateTaskMutation.mutateAsync({
        boardId: boardId!,
        cardId: card.id,
        taskId,
        data: { dueComplete }
      });
    } catch (error) {
      console.error('Failed to update task completion:', error);
    }
  }, [updateTaskMutation, boardId, card.id]);

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Partial<TaskType>) => {
      if (!boardId) return;

      try {
        await updateTaskMutation.mutateAsync({
          boardId,
          cardId: card.id,
          taskId,
          data: updates,
        });
      } catch (error) {
        console.error("Failed to update task:", error);
        throw error;
      }
    },
    [boardId, card.id, updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!boardId) return;

      try {
        await deleteTaskMutation.mutateAsync({
          boardId,
          cardId: card.id,
          taskId,
        });
      } catch (error) {
        console.error("Failed to delete task:", error);
        throw error;
      }
    },
    [boardId, card.id, deleteTaskMutation]
  );
  return (
    <>
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            data-draggable="true"
            className={`min-w-80 h-fit bg-white rounded-lg shadow-sm border ${
              snapshot.isDragging ? "shadow-lg rotate-2" : ""
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={handleTitleChange}
                    onKeyDown={handleKeyDown}
                    disabled={isUpdatingTitle}
                    className={`font-medium text-gray-900 flex-1 bg-transparent border-none outline-none focus:ring-0 ${
                      isUpdatingTitle ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                ) : (
                  <h3
                    className="font-medium text-gray-900 flex-1 cursor-pointer  px-2 py-1 rounded"
                    onClick={handleTitleClick}
                  >
                    {card.title}
                  </h3>
                )}
                <div className="flex items-center gap-2">
                  
                  <Dropdown
                    trigger={
                      <Button
                        variant="link"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      {
                        id: "delete",
                        label: "Delete card",
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => setShowDeleteConfirm(true),
                        variant: "danger" as const,
                      },
                    ]}
                    align="right"
                  />
                </div>
              </div>
            </div>

            {/* Card Tasks */}
            <Droppable droppableId={card.id} type="task">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 space-y-2 min-h-32"
                >
                  {tasks.map((task, taskIndex) => (
                    <Task
                      key={task.id}
                      task={task}
                      taskIndex={taskIndex}
                      onTaskClick={handleTaskClick}
                      onTaskCompleteChange={handleTaskCompleteChange}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Task Button */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTaskClick}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
              isOpen={showCreateTaskModal}
              onClose={handleCreateTaskCancel}
              onSubmit={handleCreateTaskSubmit}
              cardTitle={card.title}
            />
          </div>
        )}
      </Draggable>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showTaskDetailModal}
        onClose={handleTaskDetailClose}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        isLoading={updateTaskMutation.isPending || deleteTaskMutation.isPending}
        cardTitle={card.title}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          try {
            await handleDeleteCard(card.id);
          } catch (error) {
            console.error("Failed to delete card:", error);
          }
        }}
        title="Delete Card"
        message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export const Card = memo(CardComponent);
