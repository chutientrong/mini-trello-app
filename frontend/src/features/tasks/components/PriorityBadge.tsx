import { AlertTriangle, Minus, Zap } from "lucide-react";
import React from "react";

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md';
  className?: string;
}

const priorityConfig = {
  low: {
    label: 'Low',
    icon: Minus,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  medium: {
    label: 'Medium',
    icon: AlertTriangle,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  high: {
    label: 'High',
    icon: Zap,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  size = 'sm',
  className = '' 
}) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${config.className}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
};
