import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button, Image, ProfileDropdown } from "@/components";
import logoImage from "@/assets/logo.png";
import { Bell, User, Menu, X } from "lucide-react";
import { useSidebar } from "@/contexts";
import { useUnreadCount } from "@/features/notifications/hooks";
import { NotificationDropdown } from "@/features/notifications/components";

export const Header: React.FC = () => {
  const { isOpen, toggle } = useSidebar();
  const { data: unreadData } = useUnreadCount();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = unreadData?.count || 0;

  const handleNotificationToggle = useCallback(() => {
    setIsNotificationOpen((prev) => !prev);
    setIsProfileOpen(false); // Close profile dropdown when opening notifications
  }, []);

  const handleNotificationClose = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  const handleProfileToggle = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationOpen(false); // Close notification dropdown when opening profile
  }, []);

  const handleProfileClose = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Toggle Button and Logo */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={toggle}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/boards" className="flex items-center space-x-3">
            <Image
              src={logoImage}
              alt="Mini Trello"
              className="h-8 w-8"
              showError={true}
            />
            <span className="text-xl font-bold text-gray-900">Mini Trello</span>
          </Link>
        </div>

        {/* Right: Notification and Profile Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <div className="relative">
            <Button
              onClick={handleNotificationToggle}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={handleNotificationClose}
            />
          </div>

          {/* Profile Icon */}
          <div className="relative">
            <Button
              onClick={handleProfileToggle}
              variant="outline"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={handleProfileClose}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
