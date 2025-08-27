import { Draggable } from "@hello-pangea/dnd";
import React, { memo, useCallback } from "react";
import { Checkbox } from "@/components";
import type { Task as TaskType } from "../types/tasks";

interface TaskProps {
  task: TaskType;
  taskIndex: number;
  onTaskClick: (task: TaskType) => void;
  onTaskCompleteChange?: (taskId: string, dueComplete: boolean) => void;
}

const TaskComponent: React.FC<TaskProps> = ({
  task,
  taskIndex,
  onTaskClick,
  onTaskCompleteChange,
}) => {
  const isCompleted = task.dueComplete === true;

  const handleTaskClick = () => {
    onTaskClick(task);
  };

  const handleCheckboxChange = useCallback((checked: boolean) => {
    if (onTaskCompleteChange) {
      onTaskCompleteChange(task.id, checked);
    }
  }, [task.id, onTaskCompleteChange]);

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 bg-gray-50 rounded border cursor-pointer ${
            snapshot.isDragging ? "shadow-md" : ""
          } ${isCompleted ? "opacity-75" : ""}`}
          onClick={handleTaskClick}
        >
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={isCompleted}
              onChange={handleCheckboxChange}
              className="mt-0.5 flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <h4
                className={`text-sm font-medium ${
                  isCompleted
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h4>
              
              {task.description && (
                <p className={`text-xs mt-1 ${
                  isCompleted ? "text-gray-400" : "text-gray-600"
                }`}>
                  {task.description}
                </p>
              )}

              {task.dueDate && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isCompleted 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export const Task = memo(TaskComponent);
