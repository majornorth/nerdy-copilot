import React from 'react';
import { cn } from '../../utils/cn';

interface PopoverHeaderProps {
  title: string;
  className?: string;
}

/**
 * Popover header component with consistent styling
 * Used for titles in dropdown menus and popovers
 */
export const PopoverHeader: React.FC<PopoverHeaderProps> = ({
  title,
  className
}) => {
  return (
    <div className={cn(
      'px-4 py-3 border-b border-gray-100',
      'bg-gray-50',
      className
    )}>
      <h3 className="text-sm font-medium text-gray-900">
        {title}
      </h3>
    </div>
  );
};