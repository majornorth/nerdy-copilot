import React from 'react';
import { MagnifyingGlass } from 'phosphor-react';
import { cn } from '../../utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

/**
 * Search input component with magnifying glass icon
 * Used for filtering and searching within lists and menus
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search",
  onSearch,
  className,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange?.(e);
    onSearch?.(value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlass size={16} weight="regular" className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        className={cn(
          'block w-full pl-10 pr-3 py-2.5',
          'border border-gray-200 rounded-lg',
          'bg-white text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
          'transition-colors duration-200',
          'text-sm',
          className
        )}
        {...props}
      />
    </div>
  );
};