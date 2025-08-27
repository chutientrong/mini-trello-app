import { LogOut } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthProvider';
import { Button } from './Button';
import { Image } from './Image';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/signin');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Image
              src={user?.avatar || ''}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
              showError={true}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
};
