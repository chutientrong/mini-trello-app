import React from 'react';
import { Input } from '../Input';
import { Textarea } from '../Textarea';

interface FormFieldProps {
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string;
  rows?: number;
  className?: string;
  [key: string]: unknown; // Allow additional props for React Hook Form
}

export const FormField: React.FC<FormFieldProps> = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  autoFocus = false,
  error,
  rows = 3,
  className,
  ...rest
}) => {
  const isTextarea = type === 'textarea';

  if (isTextarea) {
    return (
      <Textarea
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        rows={rows}
        error={error}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <Input
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      error={error}
      className={className}
      {...rest}
    />
  );
};
