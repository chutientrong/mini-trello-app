import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import { cardKeys } from '@/features/cards/hooks';
import type { Card, CardsResponse } from '@/features/cards/types';
import type { Task } from '../types';

interface UseTaskRealtimeProps {
  boardId: string;
  cardId?: string; 
}

export const useTaskRealtime = ({ boardId, cardId }: UseTaskRealtimeProps) => {
  const { socket, isConnected, joinBoards, leaveBoards } = useSocket();
  const queryClient = useQueryClient();

  const getCardsCache = (): CardsResponse | undefined => {
    return queryClient.getQueryData(cardKeys.list(boardId));
  };

  const isCardInCache = (cardId: string): boolean => {
    const cardsCache = getCardsCache();
    return cardsCache?.data?.some((card: Card) => card.id === cardId) || false;
  };

  const updateCardsCache = (
    updater: (cards: Card[]) => Card[],
    logMessage?: string
  ) => {
    if (logMessage) {
      console.log(logMessage);
    }
    
    queryClient.setQueryData(
      cardKeys.list(boardId),
      (oldData: CardsResponse | undefined) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: updater(oldData.data)
        };
      }
    );
  };

  const invalidateCardsCache = (reason: string) => {
    console.log(`Invalidating cards query: ${reason}`);
    queryClient.invalidateQueries({ queryKey: cardKeys.list(boardId) });
  };

  const updateCardTasks = (
    cardId: string,
    taskUpdater: (tasks: Task[]) => Task[]
  ) => {
    updateCardsCache(
      (cards) => cards.map((card) => 
        card.id === cardId 
          ? { ...card, tasks: taskUpdater(card.tasks || []) }
          : card
      )
    );
  };

  const sortTasksByOrder = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => a.order - b.order);
  };

  // Join board when component mounts
  useEffect(() => {
    if (isConnected && boardId) {
      joinBoards([boardId]);
    }

    return () => {
      if (boardId) {
        leaveBoards([boardId]);
      }
    };
  }, [isConnected, boardId, joinBoards, leaveBoards]);

  // Handle real-time task updates
  useEffect(() => {
    if (!socket) return;

    // Task created
    const handleTaskCreated = (data: { task: Task; timestamp: string }) => {
      console.log('Task created real-time:', data);
      
      if (isCardInCache(data.task.cardId)) {
        updateCardTasks(
          data.task.cardId,
          (tasks) => sortTasksByOrder([...tasks, data.task])
        );
      } else {
        invalidateCardsCache('Card not in cache');
      }
    };

    // Task updated
    const handleTaskUpdated = (data: { task: Task; timestamp: string }) => {
      console.log('Task updated real-time:', data);
      
      if (isCardInCache(data.task.cardId)) {
        updateCardTasks(
          data.task.cardId,
          (tasks) => tasks.map((task) => 
            task.id === data.task.id ? data.task : task
          )
        );
      } else {
        invalidateCardsCache('Card not in cache');
      }
    };

    // Task deleted
    const handleTaskDeleted = (data: { taskId: string; cardId: string; timestamp: string }) => {
      console.log('Task deleted real-time:', data);
      
      if (isCardInCache(data.cardId)) {
        updateCardTasks(
          data.cardId,
          (tasks) => tasks.filter((task) => task.id !== data.taskId)
        );
      } else {
        invalidateCardsCache('Card not in cache');
      }
    };

    // Task reordered
    const handleTaskReordered = (data: { 
      cardId: string; 
      taskOrders: Array<{ taskId: string; order: number }>; 
      timestamp: string 
    }) => {
      console.log('Task reordered real-time:', data);
      
      if (isCardInCache(data.cardId)) {
        updateCardTasks(
          data.cardId,
          (tasks) => {
            const updatedTasks = tasks.map((task) => {
              const newOrder = data.taskOrders.find(order => order.taskId === task.id);
              return newOrder ? { ...task, order: newOrder.order } : task;
            });
            return sortTasksByOrder(updatedTasks);
          }
        );
      } else {
        invalidateCardsCache('Card not in cache');
      }
    };

    // Task moved
    const handleTaskMoved = (data: { 
      taskId: string; 
      sourceCardId: string; 
      destCardId: string; 
      newOrder: number; 
      task: Task;
      timestamp: string 
    }) => {
      console.log('Task moved real-time:', data);
      console.log('Current cardId:', cardId);
      console.log('Source cardId:', data.sourceCardId);
      console.log('Dest cardId:', data.destCardId);
      
      const sourceCardInCache = isCardInCache(data.sourceCardId);
      const destCardInCache = isCardInCache(data.destCardId);
      
      console.log('Cards cache:', getCardsCache());
      console.log('Cards in cache:', getCardsCache()?.data?.map(card => card.id));
      console.log('Destination card in cache:', destCardInCache);
      console.log('Source card in cache:', sourceCardInCache);
      
      // If cardId is provided, handle specific card updates
      if (cardId) {
        if (data.sourceCardId === cardId && sourceCardInCache) {
          updateCardTasks(
            data.sourceCardId,
            (tasks) => tasks.filter((task) => task.id !== data.taskId)
          );
        } else if (data.destCardId === cardId && destCardInCache) {
          updateCardTasks(
            data.destCardId,
            (tasks) => sortTasksByOrder([...tasks, data.task])
          );
        } else if ((data.sourceCardId === cardId && !sourceCardInCache) || 
                   (data.destCardId === cardId && !destCardInCache)) {
          invalidateCardsCache('Card not in cache');
        }
      } else {
        // If no cardId provided, handle board-level updates
        console.log('Handling board-level task move update');
        
        if (sourceCardInCache && destCardInCache) {
          console.log('Moving task between cards (board-level cache update):', data.sourceCardId, '->', data.destCardId);
          
          updateCardsCache(
            (cards) => cards.map((card) => {
              if (card.id === data.sourceCardId) {
                // Remove task from source card
                return {
                  ...card,
                  tasks: card.tasks?.filter((task) => task.id !== data.taskId) || []
                };
              } else if (card.id === data.destCardId) {
                // Add task to destination card
                const updatedTasks = [...(card.tasks || []), data.task];
                return {
                  ...card,
                  tasks: sortTasksByOrder(updatedTasks)
                };
              }
              return card;
            })
          );
        } else {
          invalidateCardsCache('Cards not in cache');
        }
      }
    };

    // Member assigned/unassigned (same logic)
    const handleMemberChange = (
      data: { taskId: string; memberId: string; task: Task; timestamp: string },
      action: 'assigned' | 'unassigned'
    ) => {
      console.log(`Member ${action} real-time:`, data);
      
      if (isCardInCache(data.task.cardId)) {
        updateCardTasks(
          data.task.cardId,
          (tasks) => tasks.map((task) => 
            task.id === data.taskId ? data.task : task
          )
        );
      } else {
        invalidateCardsCache('Card not in cache');
      }
    };

    const handleMemberAssigned = (data: { taskId: string; memberId: string; task: Task; timestamp: string }) => {
      handleMemberChange(data, 'assigned');
    };

    const handleMemberUnassigned = (data: { taskId: string; memberId: string; task: Task; timestamp: string }) => {
      handleMemberChange(data, 'unassigned');
    };

    // Listen for events
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:reordered', handleTaskReordered);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:member-assigned', handleMemberAssigned);
    socket.on('task:member-unassigned', handleMemberUnassigned);

    // Cleanup listeners
    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:reordered', handleTaskReordered);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:member-assigned', handleMemberAssigned);
      socket.off('task:member-unassigned', handleMemberUnassigned);
    };
  }, [socket, boardId, cardId, queryClient]);

  return {
    isConnected,
  };
};
