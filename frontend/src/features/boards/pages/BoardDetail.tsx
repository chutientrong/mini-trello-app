import React, {
  useState,
  useRef,
  memo,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button, LoadingSpinner } from "@/components";
import { useBoard } from "../hooks/useBoards";
import {
  useCards,
  useCreateCard,
  useReorderCards,
  useUpdateCard,
  useDeleteCard,
} from "@/features/cards/hooks/useCards";
import {
  useCreateTask,
  useReorderTasks,
  useMoveTaskToCard,
} from "@/features/tasks/hooks/useTasks";
import { useTaskRealtime } from "@/features/tasks/hooks/useTaskRealtime";
import { useSocket } from "@/contexts/SocketProvider";
import { Card, CreateCardModal } from "@/features/cards/components";

const BoardDetailComponent: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const {
    data: board,
    isLoading: boardLoading,
    error: boardError,
  } = useBoard(boardId!);
  const {
    data: cardsData,
    isLoading: cardsLoading,
    error: cardsError,
  } = useCards(boardId!);
  const createCardMutation = useCreateCard();
  const reorderCardsMutation = useReorderCards();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const createTaskMutation = useCreateTask();
  const reorderTasksMutation = useReorderTasks();
  const moveTaskToCardMutation = useMoveTaskToCard();

  const [showCreateCardModal, setShowCreateCardModal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Real-time updates
  const { joinBoards, leaveBoards } = useSocket();

  // Task real-time updates at board level
  useTaskRealtime({
    boardId: boardId!,
    // No cardId means listen to all cards in the board
  });

  // Join board for real-time updates
  useEffect(() => {
    if (boardId) {
      joinBoards([boardId]);

      return () => {
        leaveBoards([boardId]);
      };
    }
  }, [boardId, joinBoards, leaveBoards]);

  // Use refs to avoid stale closures in event handlers
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Memoized values
  const cards = useMemo(
    () => (Array.isArray(cardsData?.data) ? cardsData.data : []),
    [cardsData?.data]
  );
  const isLoading = useMemo(
    () => boardLoading || cardsLoading,
    [boardLoading, cardsLoading]
  );
  const error = useMemo(
    () => boardError || cardsError,
    [boardError, cardsError]
  );

  // Function to setup drag scroll when ref is available
  const setupDragScroll = useCallback(
    (scrollContainer: HTMLDivElement) => {
      const handleMouseDown = (e: MouseEvent) => {
        // Check if clicking on interactive elements (buttons, inputs, cards)
        const target = e.target as HTMLElement;
        const isInteractive = target.closest(
          "button, input, textarea, .card, [data-draggable]"
        );

        if (!target.closest("#scroll-container")) {
          return;
        }

        if (!isInteractive) {
          isDraggingRef.current = true;
          dragStartRef.current = { x: e.clientX, y: e.clientY };
          // scrollContainer.classList.add("dragging");
          // scrollContainer.style.cursor = "grabbing";
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const target = e.target as HTMLElement;
        if (!target.closest("#scroll-container")) {
          isDraggingRef.current = false;
          return; // Stop dragging if clicking inside a modal
        }

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Scroll the container based on drag movement
        scrollContainer.scrollBy(-deltaX, -deltaY);

        dragStartRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        // scrollContainer.classList.remove("dragging");
        // scrollContainer.style.cursor = "grab";
      };
      if (cards && cards.length > 3) {
        scrollContainer.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }

      return () => {
        scrollContainer.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    },
    [cards]
  );

  // Event handlers
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, type } = result;

      if (!destination || !boardId) return;

      if (type === "card") {
        // Reorder cards
        const reorderedCards = Array.from(cards);
        const [removed] = reorderedCards.splice(source.index, 1);
        reorderedCards.splice(destination.index, 0, removed);

        // Update order numbers
        const cardOrders = reorderedCards.map((card, index) => ({
          cardId: card.id,
          order: index,
        }));

        // Call API to update order
        reorderCardsMutation.mutate({ boardId, cardOrders: { cardOrders } });
      } else if (type === "task") {
        // Move task between cards or reorder within same card
        const sourceCard = cards.find((card) => card.id === source.droppableId);
        const destCard = cards.find(
          (card) => card.id === destination.droppableId
        );

        if (!sourceCard || !destCard) return;

        // Get tasks for the source card
        const sourceTasks = sourceCard.tasks || [];

        const taskToMove = sourceTasks[source.index];
        if (!taskToMove) return;

        // If moving to the same card (reordering)
        if (source.droppableId === destination.droppableId) {
          console.log("Reordering tasks within same card:", {
            source,
            destination,
            sourceTasks,
          });

          // Create a copy of the tasks array and reorder it based on drag result
          const reorderedTasks = Array.from(sourceTasks);
          const [removed] = reorderedTasks.splice(source.index, 1);
          reorderedTasks.splice(destination.index, 0, removed);

          console.log(
            "Original tasks:",
            sourceTasks.map((t) => ({ id: t.id, order: t.order }))
          );
          console.log(
            "Reordered tasks:",
            reorderedTasks.map((t) => ({ id: t.id, order: t.order }))
          );

          // Create task orders for the source card - use the new positions
          const taskOrders = reorderedTasks.map((task, index) => ({
            taskId: task.id,
            order: index,
          }));

          console.log("Sending reorder request:", {
            boardId,
            cardId: source.droppableId,
            taskOrders,
          });

          // Call API to reorder tasks in the same card
          reorderTasksMutation.mutate({
            boardId,
            cardId: source.droppableId,
            taskOrders,
          });
        } else {
          // Moving task between different cards
          console.log("Moving task between cards:", {
            taskId: taskToMove.id,
            sourceCardId: source.droppableId,
            destCardId: destination.droppableId,
            newOrder: destination.index,
          });

          moveTaskToCardMutation.mutate({
            boardId,
            taskId: taskToMove.id,
            sourceCardId: source.droppableId,
            destCardId: destination.droppableId,
            newOrder: destination.index,
          });
        }
      }
    },
    [
      cards,
      boardId,
      reorderCardsMutation,
      reorderTasksMutation,
      moveTaskToCardMutation,
    ]
  );

  const handleCreateCard = useCallback(
    async (title: string, description?: string) => {
      if (!boardId) return;

      try {
        await createCardMutation.mutateAsync({
          boardId,
          cardData: { title, description },
        });
        // Modal will close automatically on success
      } catch (error) {
        console.error("Failed to create card:", error);
      }
    },
    [boardId, createCardMutation]
  );

  const handleCreateTask = useCallback(
    async (cardId: string, title: string, description?: string) => {
      if (!boardId) return;

      try {
        await createTaskMutation.mutateAsync({
          boardId,
          cardId,
          data: { title, description },
        });
      } catch (error) {
        console.error("Failed to create task:", error);
        throw error; // Re-throw to let the Card component handle the error
      }
    },
    [boardId, createTaskMutation]
  );

  const handleToggleTask = useCallback(
    async (cardId: string, taskId: string) => {
      // TODO: Implement task toggle API
      console.log("Task toggle not yet implemented", { cardId, taskId });
    },
    []
  );

  const handleUpdateCardTitle = useCallback(
    async (cardId: string, title: string) => {
      try {
        await updateCardMutation.mutateAsync({
          cardId,
          updateData: { title },
        });
      } catch (error) {
        console.error("Failed to update card title:", error);
        throw error; // Re-throw to let the Card component handle the error
      }
    },
    [updateCardMutation]
  );

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteCardMutation.mutateAsync(cardId);
      } catch (error) {
        console.error("Failed to delete card:", error);
        throw error; // Re-throw to let the Card component handle the error
      }
    },
    [deleteCardMutation]
  );

  const handleShowCreateCardModal = useCallback(() => {
    setShowCreateCardModal(true);
  }, []);

  const handleHideCreateCardModal = useCallback(() => {
    setShowCreateCardModal(false);
  }, []);

  // Early returns
  if (isLoading) return <LoadingSpinner />;
  if (error) {
    console.error("BoardDetail error:", error);
    // Handle authentication errors specifically
    if (
      error.message?.includes("401") ||
      error.message?.includes("Please authenticate")
    ) {
      return <div>Please sign in to access this board.</div>;
    }
    return <div>Error loading board: {error.message}</div>;
  }
  if (!board) return <div>Board not found</div>;

  return (
    <>
      <div className="h-full bg-gray-50 flex flex-col gap-5">
        <p className="text-2xl font-bold">{board.board?.name || ""}</p>
        <div
          ref={(el) => {
            scrollContainerRef.current = el;
            if (el && cards && cards.length > 3) {
              setupDragScroll(el);
            }
          }}
          id="scroll-container"
          className="flex-1 overflow-x-scroll drag-scroll-container"
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type="card" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex space-x-6 w-[calc(100vw-308px)]"
                >
                  {cards.map((card, index) => (
                    <Card
                      key={card.id}
                      card={card}
                      index={index}
                      handleToggleTask={handleToggleTask}
                      handleCreateTask={handleCreateTask}
                      handleUpdateCardTitle={handleUpdateCardTitle}
                      handleDeleteCard={handleDeleteCard}
                      isUpdatingTitle={updateCardMutation.isPending}
                    />
                  ))}
                  {provided.placeholder}

                  {/* Create Card Button */}
                  <div className="min-w-80">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShowCreateCardModal}
                      className="w-full h-10"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Add Card
                    </Button>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateCardModal}
        onClose={handleHideCreateCardModal}
        onSubmit={handleCreateCard}
        isLoading={createCardMutation.isPending}
      />
    </>
  );
};

const BoardDetail = memo(BoardDetailComponent);
export default BoardDetail;
