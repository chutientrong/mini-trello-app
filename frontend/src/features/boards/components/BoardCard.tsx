import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

interface BoardCardProps {
  id: string;
  name: string;
  description?: string;
  cardCount?: number;
  memberCount?: number;
}

const BoardCardComponent: React.FC<BoardCardProps> = ({
  id,
  name,
  description,
  cardCount = 0,
  memberCount = 0,
}) => {
  return (
    <Link
      to={`/boards/${id}`}
      className="block group"
    >
      <div className="w-full h-full bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Board Header */}
        <div className="h-20 bg-blue-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute bottom-2 left-3">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Board Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {name}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Board Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{cardCount} cards</span>
            <span>{memberCount} members</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const BoardCard = memo(BoardCardComponent);
