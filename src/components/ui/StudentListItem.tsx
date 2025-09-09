import React from 'react';
import { cn } from '../../utils/cn';

interface StudentListItemProps {
  name: string;
  lastLesson: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Individual student list item component
 * Displays student name and last lesson date with hover and selection states
 */
export const StudentListItem: React.FC<StudentListItemProps> = ({
  name,
  lastLesson,
  isSelected = false,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left',
        'hover:bg-gray-50 transition-colors duration-150',
        'focus:outline-none focus:bg-gray-50',
        'border-b border-gray-100 last:border-b-0',
        isSelected && 'bg-brand-primary-50 text-brand-primary',
        className
      )}
    >
      <div className="flex flex-col space-y-1">
        <span className={cn(
          'font-medium text-sm',
          isSelected ? 'text-brand-primary' : 'text-gray-900'
        )}>
          {name}
        </span>
        <span className="text-xs text-gray-500">
          Last lesson: {lastLesson}
        </span>
      </div>
    </button>
  );
};