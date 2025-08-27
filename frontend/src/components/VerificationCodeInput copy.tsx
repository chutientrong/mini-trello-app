import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const VerificationCodeInput = forwardRef<HTMLInputElement, VerificationCodeInputProps>(
  (
    {
      value,
      onChange,
      onComplete,
      length = 6,
      error,
      disabled = false,
      className,
      placeholder = 'Enter verification code',
      autoFocus = false,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove any non-digit characters
      const digitsOnly = inputValue.replace(/\D/g, '');
      
      // Limit to specified length
      const formattedValue = digitsOnly.slice(0, length);
      
      onChange(formattedValue);
      
      // Call onComplete when the code is complete
      if (formattedValue.length === length && onComplete) {
        onComplete(formattedValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, and navigation keys
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
      ];
      
      // Allow Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return;
      }
      // Allow allowed keys
      if (allowedKeys.includes(e.key)) {
        return;
      }
      
      // Allow only digits (0-9)
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain');
      const digitsOnly = pastedData.replace(/\D/g, '').slice(0, length);
      onChange(digitsOnly);
      
      if (digitsOnly.length === length && onComplete) {
        onComplete(digitsOnly);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-widest',
            'focus:outline-none focus:ring-2 transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : isFocused
              ? 'border-blue-500 focus:ring-blue-500'
              : 'border-gray-300',
            className
          )}
          maxLength={length}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <p className="text-sm text-gray-500">
          Enter the {length}-digit code sent to your email
        </p>
      </div>
    );
  }
);

VerificationCodeInput.displayName = 'VerificationCodeInput';
