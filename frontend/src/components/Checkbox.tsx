import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task click when clicking checkbox
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`
        w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center
        ${checked 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : 'bg-white border-gray-300 hover:border-blue-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      onClick={handleClick}
    >
      {checked && (
        <Check className="w-3 h-3" />
      )}
    </div>
  );
};
