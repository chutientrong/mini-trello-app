import React, { useEffect, useRef, useState } from 'react';
import { SearchInput } from './SearchInput';
import { Button } from './Button';

interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  hasSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
  hasSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className='w-fit cursor-pointer'>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 mx-1 min-w-48 rounded-md bg-white shadow-lg ring-1 ring-gray-500 ring-opacity-5 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="py-1" role="menu">
            {/* Search Input */}
            {hasSearch && (
              <>
              <div className="px-3 py-2 border-b border-gray-200">
                <SearchInput
                  value={searchValue}
                  onChange={onSearchChange || (() => {})}
                  placeholder={searchPlaceholder}
  
                />
              </div>
              <div className="space-y-2 pb-4"></div>
              </>
            )}
            {items.map((item) => (
              <Button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center justify-start px-4 py-2 text-sm hover:bg-gray-100 ${
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700'
                }`}
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
