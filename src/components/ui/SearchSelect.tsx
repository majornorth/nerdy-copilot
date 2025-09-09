import React from 'react';
import { MagnifyingGlass, CalendarBlank } from 'phosphor-react';
import { cn } from '../../utils/cn';

interface SearchSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: 'search' | 'calendar';
}

/**
 * Search/select input component with icon
 * Used for student selection and session selection
 */
export const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  error,
  helperText,
  icon = 'search',
  className,
  id,
  ...props
}) => {
  const inputId = id || `search-select-${Math.random().toString(36).substr(2, 9)}`;
  const IconComponent = icon === 'calendar' ? CalendarBlank : MagnifyingGlass;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconComponent 
            size={16} 
            weight="regular" 
            className="text-gray-400"
          />
        </div>
        
        <input
          id={inputId}
          className={cn(
            'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
            'transition-colors duration-200',
            'text-gray-900 placeholder-gray-400',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};