import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Boards',
    href: '/boards',
    icon: LayoutDashboard,
  },
  {
    name: 'All Members',
    href: '/members',
    icon: Users,
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-700' : 'text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
