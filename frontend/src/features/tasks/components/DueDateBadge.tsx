import { Calendar, Clock } from "lucide-react";
import React from "react";

interface DueDateBadgeProps {
  dueDate: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({ 
  dueDate, 
  size = 'sm',
  className = '' 
}) => {
  const date = new Date(dueDate);
  const now = new Date();
  const isOverdue = date < now;
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusColor = () => {
    if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
    if (isToday) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (isTomorrow) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getDisplayText = () => {
    const timeStr = formatTime(date);
    if (isOverdue) return `Overdue ${timeStr}`;
    if (isToday) return `Due today ${timeStr}`;
    if (isTomorrow) return `Due tomorrow ${timeStr}`;
    return `${date.toLocaleDateString()} ${timeStr}`;
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${getStatusColor()}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isOverdue ? (
        <Clock className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      ) : (
        <Calendar className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
      <span className="font-medium">{getDisplayText()}</span>
    </div>
  );
};
