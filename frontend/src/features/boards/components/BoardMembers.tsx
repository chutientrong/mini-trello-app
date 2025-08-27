import React, { memo } from 'react';
import { Users, Crown, Shield, User, Eye } from 'lucide-react';
import type { BoardMember } from '../types/boards';

interface BoardMembersProps {
  members: BoardMember[];
  ownerId: string;
  className?: string;
}

const BoardMembersComponent: React.FC<BoardMembersProps> = ({
  members,
  ownerId,
  className = '',
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'member':
        return <User className="h-3 w-3 text-green-500" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-500" />;
      default:
        return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500';
      case 'admin':
        return 'bg-blue-500';
      case 'member':
        return 'bg-green-500';
      case 'viewer':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    // Owner first, then by role priority, then alphabetically
    if (a.userId === ownerId) return -1;
    if (b.userId === ownerId) return 1;
    
    const rolePriority = { owner: 0, admin: 1, member: 2, viewer: 3 };
    const aPriority = rolePriority[a.role as keyof typeof rolePriority] ?? 3;
    const bPriority = rolePriority[b.role as keyof typeof rolePriority] ?? 3;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.userId.localeCompare(b.userId);
  });

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Members ({members.length})</h3>
      </div>
      
      <div className="space-y-2">
        {sortedMembers.map((member) => {
          const isOwner = member.userId === ownerId;
          const roleColor = getRoleColor(member.role);
          
          return (
            <div
              key={member.userId}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 ${roleColor} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                {member.fullName?.charAt(0).toUpperCase() || ''}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.fullName}
                  </p>
                  {getRoleIcon(member.role)}
                </div>
                <p className="text-xs text-gray-500">
                  {member.email}
                  {isOwner && ' (Owner)'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BoardMembers = memo(BoardMembersComponent);
